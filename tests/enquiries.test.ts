import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalDatabase } from '../scripts/sqlite-adapter';
import { handleEnquiry, deliverEnquiry, type EnquiryEnv } from '../src/lib/enquiry-server';
import { validateEnquiry } from '../src/lib/enquiry-validation';

const payload = {
  name: 'Example Buyer',
  email: 'buyer@example.test',
  phone: '',
  message: 'Example equipment enquiry for a local test.',
  language: 'en',
  machineId: 'ex210',
};
function request(
  body: unknown = payload,
  key = crypto.randomUUID(),
  origin = 'http://localhost:4321',
) {
  return new Request('http://localhost:4321/api/enquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'Idempotency-Key': key,
      'CF-Connecting-IP': '192.0.2.1',
    },
    body: JSON.stringify(body),
  });
}
function setup() {
  const local = createLocalDatabase();
  const env: EnquiryEnv = {
    DB: local.db,
    ENVIRONMENT: 'preview',
    SITE_ORIGIN: 'http://localhost:4321',
  };
  return { ...local, env };
}
test('validation accepts phone-only contacts and rejects missing contacts, malformed email and oversized messages', () => {
  assert.equal(validateEnquiry({ ...payload, email: '', phone: '+90 312 555 0000' }).ok, true);
  assert.equal(validateEnquiry({ ...payload, email: '' }).ok, false);
  assert.equal(validateEnquiry({ ...payload, email: 'invalid' }).ok, false);
  assert.equal(validateEnquiry({ ...payload, message: 'a'.repeat(4001) }).ok, false);
  assert.equal(validateEnquiry({ ...payload, language: 'de' }).ok, false);
});
test('saves a preview before acknowledgement and does not dispatch email', async () => {
  const { env, sqlite, close } = setup();
  let dispatches = 0;
  try {
    const response = await handleEnquiry(request(), env, () => dispatches++);
    assert.equal(response.status, 201);
    assert.equal(((await response.json()) as any).preview, true);
    assert.equal((sqlite.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as any).count, 1);
    assert.equal(
      (sqlite.prepare('SELECT notification_status FROM enquiries').get() as any)
        .notification_status,
      'preview',
    );
    assert.equal(dispatches, 0);
  } finally {
    close();
  }
});
test('same idempotency key retries safely; changed payload is rejected', async () => {
  const { env, sqlite, close } = setup();
  const key = crypto.randomUUID();
  try {
    assert.equal((await handleEnquiry(request(payload, key), env, () => {})).status, 201);
    assert.equal((await handleEnquiry(request(payload, key), env, () => {})).status, 200);
    assert.equal(
      (await handleEnquiry(request({ ...payload, name: 'Different Buyer' }, key), env, () => {}))
        .status,
      409,
    );
    assert.equal((sqlite.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as any).count, 1);
  } finally {
    close();
  }
});
test('concurrent duplicate submissions create only one record', async () => {
  const { env, sqlite, close } = setup();
  const key = crypto.randomUUID();
  try {
    const responses = await Promise.all([
      handleEnquiry(request(payload, key), env, () => {}),
      handleEnquiry(request(payload, key), env, () => {}),
    ]);
    assert.ok(responses.every((r) => [200, 201].includes(r.status)));
    assert.equal((sqlite.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as any).count, 1);
  } finally {
    close();
  }
});
test('rejects cross-origin requests, honeypots and invalid input without saving', async () => {
  const { env, sqlite, close } = setup();
  try {
    assert.equal(
      (
        await handleEnquiry(
          request(payload, crypto.randomUUID(), 'https://other.example'),
          env,
          () => {},
        )
      ).status,
      403,
    );
    assert.equal(
      (await handleEnquiry(request({ ...payload, website: 'spam' }), env, () => {})).status,
      400,
    );
    assert.equal(
      (await handleEnquiry(request({ ...payload, name: '' }), env, () => {})).status,
      400,
    );
    assert.equal((sqlite.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as any).count, 0);
  } finally {
    close();
  }
});
test('rate limits new submissions while still acknowledging an existing retry', async () => {
  const { env, sqlite, close } = setup();
  const first = crypto.randomUUID();
  try {
    assert.equal((await handleEnquiry(request(payload, first), env, () => {})).status, 201);
    for (let i = 0; i < 4; i++)
      assert.equal((await handleEnquiry(request(), env, () => {})).status, 201);
    assert.equal((await handleEnquiry(request(), env, () => {})).status, 429);
    assert.equal((await handleEnquiry(request(payload, first), env, () => {})).status, 200);
    const row = sqlite.prepare('SELECT key FROM rate_limits').get() as any;
    assert.ok(!row.key.includes('192.0.2.1'));
  } finally {
    close();
  }
});
test('missing database or production secrets returns unavailable, never false success', async () => {
  assert.equal((await handleEnquiry(request(), {}, () => {})).status, 503);
  const { env, close } = setup();
  try {
    assert.equal(
      (await handleEnquiry(request(), { ...env, ENVIRONMENT: 'production' }, () => {})).status,
      503,
    );
  } finally {
    close();
  }
});
test('database failures do not acknowledge receipt', async () => {
  const { env, close } = setup();
  close();
  assert.equal((await handleEnquiry(request(), env, () => {})).status, 503);
});
test('production challenge verifies hostname and stores before background delivery', async () => {
  const { env, sqlite, close } = setup();
  const queue: Promise<unknown>[] = [];
  Object.assign(env, {
    ENVIRONMENT: 'production',
    SITE_ORIGIN: 'https://machines.example',
    RESEND_API_KEY: 'test-secret',
    SALES_EMAIL: 'sales@example.test',
    FROM_EMAIL: 'site@example.test',
    RATE_LIMIT_SECRET: 'a'.repeat(32),
    TURNSTILE_SECRET_KEY: 'test-secret',
  });
  const req = request(
    { ...payload, 'cf-turnstile-response': 'test-token' },
    crypto.randomUUID(),
    'https://machines.example',
  );
  const fakeFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ success: true, hostname: 'machines.example' }));
  try {
    const result = await handleEnquiry(req, env, (p) => queue.push(p), fakeFetch);
    assert.equal(result.status, 201);
    assert.equal((sqlite.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as any).count, 1);
    await Promise.all(queue);
    assert.equal(
      (sqlite.prepare('SELECT notification_status FROM enquiries').get() as any)
        .notification_status,
      'sent',
    );
    const wrongHost: typeof fetch = async () =>
      new Response(JSON.stringify({ success: true, hostname: 'wrong.example' }));
    assert.equal(
      (
        await handleEnquiry(
          request(
            { ...payload, 'cf-turnstile-response': 'test-token' },
            crypto.randomUUID(),
            'https://machines.example',
          ),
          env,
          () => {},
          wrongHost,
        )
      ).status,
      400,
    );
  } finally {
    await Promise.all(queue);
    close();
  }
});
test('email failures preserve the enquiry, schedule a retry and use stable provider idempotency', async () => {
  const { env, sqlite, close } = setup();
  const key = crypto.randomUUID();
  const providerKeys: string[] = [];
  try {
    await handleEnquiry(request(payload, key), env, () => {});
    Object.assign(env, {
      ENVIRONMENT: 'production',
      SITE_ORIGIN: 'https://machines.example',
      RESEND_API_KEY: 'test-secret',
      SALES_EMAIL: 'sales@example.test',
      FROM_EMAIL: 'site@example.test',
      RATE_LIMIT_SECRET: 'a'.repeat(32),
      TURNSTILE_SECRET_KEY: 'test-secret',
    });
    sqlite.prepare("UPDATE enquiries SET notification_status='pending', next_attempt_at=0").run();
    const failing: typeof fetch = async (_url, init) => {
      providerKeys.push(new Headers(init?.headers).get('Idempotency-Key')!);
      return new Response('', { status: 503 });
    };
    await deliverEnquiry(key, env, failing);
    const pending = sqlite.prepare('SELECT * FROM enquiries').get() as any;
    assert.equal(pending.notification_status, 'pending');
    assert.equal(pending.attempts, 1);
    assert.ok(pending.next_attempt_at > Date.now());
    sqlite.prepare('UPDATE enquiries SET next_attempt_at=0').run();
    await deliverEnquiry(key, env, async (_url, init) => {
      providerKeys.push(new Headers(init?.headers).get('Idempotency-Key')!);
      return new Response('{}');
    });
    assert.equal(
      (sqlite.prepare('SELECT notification_status FROM enquiries').get() as any)
        .notification_status,
      'sent',
    );
    assert.deepEqual(providerKeys, [`enquiry-${key}`, `enquiry-${key}`]);
  } finally {
    close();
  }
});
test('notification lease prevents two workers dispatching the same enquiry concurrently', async () => {
  const { env, sqlite, close } = setup();
  const key = crypto.randomUUID();
  let sent = 0;
  try {
    await handleEnquiry(request(payload, key), env, () => {});
    Object.assign(env, {
      ENVIRONMENT: 'production',
      SITE_ORIGIN: 'https://machines.example',
      RESEND_API_KEY: 'test',
      SALES_EMAIL: 'sales@example.test',
      FROM_EMAIL: 'site@example.test',
      RATE_LIMIT_SECRET: 'a'.repeat(32),
      TURNSTILE_SECRET_KEY: 'test',
    });
    sqlite.prepare("UPDATE enquiries SET notification_status='pending', next_attempt_at=0").run();
    const fetcher: typeof fetch = async () => {
      sent++;
      return new Response('{}');
    };
    await Promise.all([deliverEnquiry(key, env, fetcher), deliverEnquiry(key, env, fetcher)]);
    assert.equal(sent, 1);
  } finally {
    close();
  }
});
