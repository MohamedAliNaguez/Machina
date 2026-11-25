import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSiteWorker } from '../deployment/cloudflare/worker.mjs';

const assets = {
  ASSETS: {
    fetch: async (request: Request) =>
      new Response(new URL(request.url).pathname === '/missing/' ? 'Missing' : 'Static page', {
        status: new URL(request.url).pathname === '/missing/' ? 404 : 200,
      }),
  },
};
test('canonical redirects preserve the path and product query without open redirects', async () => {
  const worker = createSiteWorker(false, { '/en/products/legacy/': '/en/products/current/' });
  const www = await worker.fetch(
    new Request('https://www.technicsan.com/en/contact/?product=lpg-bobtail'),
    assets,
  );
  assert.equal(www.status, 308);
  assert.equal(
    www.headers.get('location'),
    'https://technicsan.com/en/contact/?product=lpg-bobtail',
  );
  const hostile = await worker.fetch(
    new Request('http://www.technicsan.com//example.com/path'),
    assets,
  );
  assert.equal(new URL(hostile.headers.get('location')!).hostname, 'technicsan.com');
  const root = await worker.fetch(new Request('https://technicsan.com/'), assets);
  assert.equal(root.headers.get('location'), 'https://technicsan.com/en/');
  const alias = await worker.fetch(
    new Request('https://technicsan.com/en/products/legacy/?source=check'),
    assets,
  );
  assert.equal(alias.status, 301);
  assert.equal(
    alias.headers.get('location'),
    'https://technicsan.com/en/products/current/?source=check',
  );
});
test('preview URLs remain noindex after a selective production search release', async () => {
  const worker = createSiteWorker(true);
  for (const hostname of ['technicsan.pages.dev', 'abc.technicsan.pages.dev']) {
    const response = await worker.fetch(new Request(`https://${hostname}/en/`), assets);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
  }
  const ready = await worker.fetch(new Request('https://technicsan.com/en/'), assets);
  assert.equal(ready.headers.get('x-robots-tag'), null);
  assert.match(ready.headers.get('content-security-policy')!, /formspree.io/);
  const pending = await createSiteWorker(false).fetch(
    new Request('https://technicsan.com/en/'),
    assets,
  );
  assert.equal(pending.headers.get('x-robots-tag'), 'noindex, follow');
  const missing = await worker.fetch(new Request('https://technicsan.com/missing/'), assets);
  assert.equal(missing.status, 404);
});
