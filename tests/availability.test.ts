import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAvailabilityReader } from '../deployment/cloudflare/availability.mjs';
import { createSiteWorker } from '../deployment/cloudflare/worker.mjs';

const config = { projectId: 'orvo6y9t', dataset: 'production' };
function fixture() {
  const values = new Map<string, Response>();
  let status = 'online',
    time = 100000,
    requests = 0,
    failing = false;
  const cache = {
    match: async (key: Request) => values.get(key.url)?.clone(),
    put: async (key: Request, response: Response) => {
      values.set(key.url, response.clone());
    },
  };
  const fetch = async (url: string, init: RequestInit) => {
    requests++;
    const parsed = new URL(url);
    assert.equal(parsed.hostname, 'orvo6y9t.api.sanity.io');
    assert.equal(parsed.searchParams.get('perspective'), 'published');
    assert.ok(parsed.searchParams.get('query')?.includes('websiteAvailability'));
    assert.equal(init.cache, 'no-store');
    assert.ok(init.signal);
    if (failing) throw new Error('Unavailable');
    return Response.json({ result: { status } });
  };
  return {
    cache,
    fetch,
    now: () => time,
    change: (next: string) => {
      status = next;
    },
    advance: () => {
      time += 30001;
    },
    fail: () => {
      failing = true;
    },
    requests: () => requests,
  };
}

test('website status changes without rebuilding, refreshes within 30 seconds and deduplicates reads', async () => {
  const f = fixture(),
    read = createAvailabilityReader(config, f);
  assert.deepEqual(await Promise.all([read(), read(), read()]), ['online', 'online', 'online']);
  assert.equal(f.requests(), 1);
  f.change('maintenance');
  assert.equal(await read(), 'online');
  f.advance();
  assert.equal(await read(), 'maintenance');
  // A new Worker deployment reads the saved state instead of resetting it.
  assert.equal(await createAvailabilityReader(config, f)(), 'maintenance');
  assert.equal(f.requests(), 2);
  f.change('online');
  f.advance();
  assert.equal(await read(), 'online');
});

test('status source and cache failures retain known maintenance state and do not invent outages on cold edges', async () => {
  const f = fixture();
  f.change('maintenance');
  assert.equal(await createAvailabilityReader(config, f)(), 'maintenance');
  f.advance();
  f.fail();
  const read = createAvailabilityReader(config, f);
  assert.equal(await read(), 'maintenance');
  assert.equal(await read(), 'maintenance');
  assert.equal(f.requests(), 2);
  const cold = fixture();
  cold.fail();
  assert.equal(await createAvailabilityReader(config, cold)(), 'online');
  const brokenCache = {
    match: async () => {
      throw new Error('Cache unavailable');
    },
    put: async () => {
      throw new Error('Cache unavailable');
    },
  };
  const healthy = fixture();
  healthy.change('maintenance');
  assert.equal(
    await createAvailabilityReader(config, { ...healthy, cache: brokenCache })(),
    'maintenance',
  );
  const invalid = fixture();
  invalid.change('unknown');
  assert.equal(await createAvailabilityReader(config, invalid)(), 'online');
});

test('maintenance serves a bilingual temporary 503 across pages, search files and form requests, with no bypass', async () => {
  let status = 'maintenance',
    assetReads = 0;
  const worker = createSiteWorker(true, { '/old/': '/en/' }, [], {
    readStatus: async () => status,
  });
  const env = {
    ASSETS: {
      fetch: async () => {
        assetReads++;
        return new Response('Published website');
      },
    },
  };
  for (const path of [
    '/',
    '/en/',
    '/en/products/lpg-bobtail/',
    '/old/',
    '/missing/',
    '/robots.txt',
    '/sitemap.xml',
    '/en/?status=online&preview=true',
  ]) {
    const response = await worker.fetch(new Request('https://technicsan.com' + path), env);
    assert.equal(response.status, 503, path);
    assert.equal(response.headers.get('retry-after'), '3600');
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(response.headers.get('x-robots-tag')!, /noindex/);
    assert.match(await response.text(), /A short pause/);
  }
  assert.equal(assetReads, 0);
  const tr = await worker.fetch(new Request('https://technicsan.com/tr/iletisim/'), env);
  assert.equal(tr.headers.get('content-language'), 'tr');
  assert.match(await tr.text(), /Web sitemizi/);
  const head = await worker.fetch(
    new Request('https://technicsan.com/en/', { method: 'HEAD' }),
    env,
  );
  assert.equal(head.status, 503);
  assert.equal(await head.text(), '');
  const post = await worker.fetch(
    new Request('https://technicsan.com/api/enquiries', { method: 'POST', body: 'test' }),
    env,
  );
  assert.equal(post.status, 503);
  const www = await worker.fetch(new Request('http://www.technicsan.com/en/'), env);
  assert.equal(www.status, 308);
  assert.equal(www.headers.get('location'), 'https://technicsan.com/en/');
  status = 'online';
  const live = await worker.fetch(new Request('https://technicsan.com/en/'), env);
  assert.equal(live.status, 200);
  assert.equal(await live.text(), 'Published website');
  assert.equal(live.headers.get('retry-after'), null);
});
