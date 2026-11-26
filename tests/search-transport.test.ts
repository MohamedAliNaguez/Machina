import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifySearchTransport } from '../src/lib/search-transport';
function response(url: string, status = 200, location?: string) {
  return {
    url,
    status,
    ok: status === 200,
    headers: new Headers(location ? { location } : {}),
  } as Response;
}
test('search release requires valid HTTPS plus apex and www canonical redirects', async () => {
  const request = (async (input: string | URL | Request) =>
    String(input).startsWith('https://technicsan.com')
      ? response('https://technicsan.com/')
      : response(String(input), 301, 'https://technicsan.com/')) as typeof fetch;
  await verifySearchTransport('https://technicsan.com', request);
  await assert.rejects(() => verifySearchTransport('http://technicsan.com', request), /requires/);
  await assert.rejects(
    () =>
      verifySearchTransport('https://technicsan.com', (async () => {
        throw new Error('TLS certificate invalid');
      }) as typeof fetch),
    /TLS/,
  );
  await assert.rejects(
    () =>
      verifySearchTransport('https://technicsan.com', (async (input) =>
        response(String(input))) as typeof fetch),
    /redirect/,
  );
});

test('intentional maintenance allows deployment without accepting an unexplained outage', async () => {
  const request = (async (input: string | URL | Request) => {
    if (!String(input).startsWith('https://technicsan.com'))
      return response(String(input), 308, 'https://technicsan.com/');
    const value = response('https://technicsan.com/', 503);
    value.headers.set('x-technicsan-status', 'maintenance');
    value.headers.set('retry-after', '3600');
    return value;
  }) as typeof fetch;
  await verifySearchTransport('https://technicsan.com', request);
  await assert.rejects(
    () =>
      verifySearchTransport('https://technicsan.com', (async () =>
        response('https://technicsan.com/', 503)) as typeof fetch),
    /HTTPS/,
  );
});
