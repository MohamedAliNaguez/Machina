import { validateEnquiry, type EnquiryInput } from './enquiry-validation';
import type { D1Database } from '@cloudflare/workers-types';
export interface EnquiryEnv {
  DB?: D1Database;
  ENVIRONMENT?: string;
  SITE_ORIGIN?: string;
  RESEND_API_KEY?: string;
  SALES_EMAIL?: string;
  FROM_EMAIL?: string;
  RATE_LIMIT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
}
type EnquiryRow = EnquiryInput & {
  id: string;
  payload_hash: string;
  notification_status: string;
  attempts: number;
};
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
const hash = async (text: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
async function rateKey(ip: string, secret: string, bucket: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${bucket}:${ip}`)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export function productionReady(env: EnquiryEnv) {
  return Boolean(
    env.DB &&
    env.SITE_ORIGIN?.startsWith('https://') &&
    env.RESEND_API_KEY &&
    env.SALES_EMAIL &&
    env.FROM_EMAIL &&
    env.TURNSTILE_SECRET_KEY &&
    env.RATE_LIMIT_SECRET &&
    env.RATE_LIMIT_SECRET.length >= 32,
  );
}
export async function handleEnquiry(
  request: Request,
  env: EnquiryEnv,
  waitUntil: (promise: Promise<unknown>) => void,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const preview = env.ENVIRONMENT !== 'production';
  if (!env.DB || (!preview && !productionReady(env))) return json({ error: 'unavailable' }, 503);
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'POST' });
  const expectedOrigin = env.SITE_ORIGIN || new URL(request.url).origin;
  if (request.headers.get('Origin') !== expectedOrigin) return json({ error: 'origin' }, 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json'))
    return json({ error: 'content_type' }, 415);
  if (Number(request.headers.get('Content-Length')) > 16000)
    return json({ error: 'too_large' }, 413);
  const key = request.headers.get('Idempotency-Key');
  if (!key || !/^[a-f0-9-]{36}$/i.test(key)) return json({ error: 'idempotency_key' }, 400);
  let raw: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 16000) return json({ error: 'too_large' }, 413);
    raw = JSON.parse(text);
    if (!raw || Array.isArray(raw) || typeof raw !== 'object') throw new Error('shape');
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (raw.website) return json({ error: 'invalid' }, 400);
  const validation = validateEnquiry(raw);
  if (!validation.ok) return json({ error: 'validation', fields: validation.errors }, 400);
  const value = validation.value;
  const payloadHash = await hash(JSON.stringify(value));
  const db = env.DB;
  try {
    const existing = await db
      .prepare('SELECT id, payload_hash FROM enquiries WHERE id = ?')
      .bind(key)
      .first<{ id: string; payload_hash: string }>();
    if (existing)
      return existing.payload_hash === payloadHash
        ? json({ accepted: true, id: key, preview }, 200)
        : json({ error: 'conflict' }, 409);
    const now = Date.now();
    const bucket = Math.floor(now / 600000);
    const ipHash = await rateKey(
      request.headers.get('CF-Connecting-IP') || 'local',
      env.RATE_LIMIT_SECRET || 'development-only-rate-key-not-for-production',
      bucket,
    );
    const rate = await db
      .prepare(
        'INSERT INTO rate_limits (key, hits, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = hits + 1 RETURNING hits',
      )
      .bind(ipHash, now + 600000)
      .first<{ hits: number }>();
    if (rate && rate.hits > 5) return json({ error: 'rate_limit' }, 429, { 'Retry-After': '600' });
    if (!preview) {
      const token =
        typeof raw['cf-turnstile-response'] === 'string' ? raw['cf-turnstile-response'] : '';
      if (!token) return json({ error: 'challenge' }, 400);
      const check = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY!,
          response: token,
          idempotency_key: key,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!check.ok) return json({ error: 'challenge_unavailable' }, 503);
      const result = (await check.json()) as { success: boolean; hostname: string };
      if (!result.success || result.hostname !== new URL(expectedOrigin).hostname)
        return json({ error: 'challenge' }, 400);
    }
    await db
      .prepare(
        'INSERT INTO enquiries (id, name, email, phone, message, language, machineId, payload_hash, notification_status, attempts, next_attempt_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?) ON CONFLICT(id) DO NOTHING',
      )
      .bind(
        key,
        value.name,
        value.email,
        value.phone,
        value.message,
        value.language,
        value.machineId,
        payloadHash,
        preview ? 'preview' : 'pending',
        now,
        now,
      )
      .run();
    // Concurrent submissions can share a key. Verify the committed payload before acknowledging.
    const committed = await db
      .prepare('SELECT payload_hash FROM enquiries WHERE id = ?')
      .bind(key)
      .first<{ payload_hash: string }>();
    if (committed?.payload_hash !== payloadHash) return json({ error: 'conflict' }, 409);
    if (!preview) waitUntil(deliverEnquiry(key, env, fetcher));
    return json({ accepted: true, id: key, preview }, 201);
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
export async function deliverEnquiry(id: string, env: EnquiryEnv, fetcher: typeof fetch = fetch) {
  if (!env.DB || env.ENVIRONMENT !== 'production' || !productionReady(env)) return;
  const now = Date.now();
  const claimed = await env.DB.prepare(
    "UPDATE enquiries SET notification_status = 'sending', lease_until = ? WHERE id = ? AND attempts < 5 AND ((notification_status = 'pending' AND next_attempt_at <= ?) OR (notification_status = 'sending' AND lease_until < ?)) RETURNING *",
  )
    .bind(now + 600000, id, now, now)
    .first<EnquiryRow>();
  if (!claimed) return;
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `enquiry-${id}`,
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.SALES_EMAIL],
        ...(claimed.email ? { reply_to: claimed.email } : {}),
        subject: `Machinery enquiry · ${claimed.machineId || 'General'} · ${claimed.language.toUpperCase()}`,
        text: `Reference: ${id}\nName / company: ${claimed.name}\nEmail: ${claimed.email || 'Not supplied'}\nPhone: ${claimed.phone || 'Not supplied'}\nMachine: ${claimed.machineId || 'General'}\nLanguage: ${claimed.language}\n\n${claimed.message}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('email_provider');
    await env.DB.prepare(
      "UPDATE enquiries SET notification_status = 'sent', sent_at = ?, lease_until = NULL WHERE id = ?",
    )
      .bind(Date.now(), id)
      .run();
  } catch {
    const attempts = claimed.attempts + 1;
    await env.DB.prepare(
      'UPDATE enquiries SET notification_status = ?, attempts = ?, next_attempt_at = ?, lease_until = NULL WHERE id = ?',
    )
      .bind(
        attempts >= 5 ? 'failed' : 'pending',
        attempts,
        Date.now() + Math.min(3600000, 30000 * 2 ** attempts),
        id,
      )
      .run();
    console.warn(`Enquiry notification deferred: ${id}`);
  }
}
export async function retryNotifications(env: EnquiryEnv) {
  if (!env.DB || env.ENVIRONMENT !== 'production') return;
  const result = await env.DB.prepare(
    "SELECT id FROM enquiries WHERE attempts < 5 AND ((notification_status = 'pending' AND next_attempt_at <= ?) OR (notification_status = 'sending' AND lease_until < ?)) ORDER BY created_at LIMIT 20",
  )
    .bind(Date.now(), Date.now())
    .all<{ id: string }>();
  await Promise.all(result.results.map((row) => deliverEnquiry(row.id, env)));
  await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(Date.now()).run();
}
