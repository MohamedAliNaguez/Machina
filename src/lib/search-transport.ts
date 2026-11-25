export async function verifySearchTransport(origin: string, request: typeof fetch = fetch) {
  if (origin !== 'https://technicsan.com')
    throw new Error('Search release requires https://technicsan.com.');
  const secure = await request(origin, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
  if (!secure.ok || new URL(secure.url).origin !== origin)
    throw new Error('Production HTTPS is not reachable on the canonical host.');
  for (const address of ['http://technicsan.com', 'https://www.technicsan.com']) {
    const response = await request(address, {
      signal: AbortSignal.timeout(20000),
      redirect: 'manual',
    });
    const location = response.headers.get('location');
    if (
      ![301, 302, 307, 308].includes(response.status) ||
      !location ||
      new URL(location, origin).origin !== origin
    )
      throw new Error('HTTP and www must redirect consistently to the HTTPS canonical host.');
  }
}
