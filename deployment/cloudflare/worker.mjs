export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://cdn.sanity.io; font-src 'self'; connect-src 'self' https://formspree.io https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'",
};

export function createSecurityHeaders(scriptHashes = []) {
  const hashes = scriptHashes.filter((hash) => /^'sha256-[A-Za-z0-9+/]{43}='$/.test(hash));
  return {
    ...securityHeaders,
    'Content-Security-Policy': securityHeaders['Content-Security-Policy'].replace(
      "script-src 'self'",
      ["script-src 'self'", ...hashes].join(' '),
    ),
  };
}

/** Static assets plus canonical redirects; no enquiry storage or mail credentials. */
export function createSiteWorker(searchRelease = false, aliases = {}, scriptHashes = []) {
  const responseHeaders = createSecurityHeaders(scriptHashes);
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const headersFor = (response) => {
        const headers = new Headers(response.headers);
        for (const [name, value] of Object.entries(responseHeaders)) headers.set(name, value);
        // A released artifact must still remain excluded on Pages preview hostnames.
        if (!searchRelease || url.hostname !== 'technicsan.com')
          headers.set('X-Robots-Tag', 'noindex, follow');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      };
      if (
        url.hostname === 'www.technicsan.com' ||
        (url.hostname === 'technicsan.com' && url.protocol !== 'https:')
      ) {
        url.protocol = 'https:';
        url.hostname = 'technicsan.com';
        url.port = '';
        return headersFor(Response.redirect(url.href, 308));
      }
      if (url.pathname === '/') {
        url.pathname = '/en/';
        return headersFor(Response.redirect(url.href, 302));
      }
      const target =
        aliases[url.pathname] ||
        aliases[url.pathname.endsWith('/') ? url.pathname : url.pathname + '/'];
      if (target) {
        const next = new URL(target, url.origin);
        next.search = url.search;
        return headersFor(Response.redirect(next.href, 301));
      }
      return headersFor(await env.ASSETS.fetch(request));
    },
  };
}

export default createSiteWorker(
  /*__TECHNICSAN_SEARCH_RELEASE__*/ false,
  /*__TECHNICSAN_ALIASES__*/ {},
  /*__TECHNICSAN_SCRIPT_HASHES__*/ [],
);
