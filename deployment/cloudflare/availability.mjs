const validStatus = (status) => status === 'online' || status === 'maintenance';

/** Read only the published control document. Cache the last known state at the edge. */
export function createAvailabilityReader(config, options = {}) {
  const fetchStatus = options.fetch || globalThis.fetch;
  const cache = options.cache || globalThis.caches?.default;
  const now = options.now || Date.now;
  let remembered;
  let pending;
  let retryAt = 0;
  if (!/^[a-z0-9]+$/.test(config.projectId || '') || !/^[a-z0-9_-]+$/.test(config.dataset || ''))
    throw new Error('Invalid availability project configuration.');
  const key = new Request(
    `https://technicsan.com/__edge-control/${config.projectId}/${config.dataset}/availability-v1`,
  );
  const endpoint = new URL(
    `https://${config.projectId}.api.sanity.io/v2025-02-19/data/query/${config.dataset}`,
  );
  endpoint.searchParams.set('query', '*[_id == "websiteAvailability"][0]{status}');
  endpoint.searchParams.set('perspective', 'published');
  const refresh = async () => {
    if (!remembered && cache) {
      try {
        const saved = await (await cache.match(key))?.json();
        if (validStatus(saved?.status) && Number.isFinite(saved.checkedAt)) remembered = saved;
      } catch {
        /* A cache failure must not make a working website unavailable. */
      }
    }
    const time = now();
    if (remembered && time - remembered.checkedAt < 30000) return remembered.status;
    if (time < retryAt) return remembered?.status || 'online';
    try {
      const response = await fetchStatus(endpoint.href, {
        signal: AbortSignal.timeout(1500),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Status source unavailable.');
      const status = (await response.json()).result?.status;
      if (!validStatus(status)) throw new Error('Missing or invalid website status.');
      remembered = { status, checkedAt: time };
      if (cache) {
        try {
          await cache.put(
            key,
            Response.json(remembered, { headers: { 'Cache-Control': 'public, max-age=86400' } }),
          );
        } catch {
          /* The in-memory state still applies if edge storage is unavailable. */
        }
      }
      return status;
    } catch {
      retryAt = time + 30000;
      // Keep a known maintenance state during an outage. A cold edge without any
      // known state stays online; this is a maintenance control, not access protection.
      return remembered?.status || 'online';
    }
  };
  return async () => {
    if (pending) return pending;
    pending = refresh();
    try {
      return await pending;
    } finally {
      pending = undefined;
    }
  };
}

export function maintenanceResponse(request) {
  const url = new URL(request.url);
  const tr = url.pathname === '/tr' || url.pathname.startsWith('/tr/');
  const text = tr
    ? {
        language: 'tr',
        label: 'WEB SİTESİ BAKIMDA',
        title: 'Kısa bir ara. Aynı basınç',
        message:
          'Web sitemizi güncelliyoruz. Ürünlerimiz ve projeleriniz hakkında ekibimizle iletişime geçebilirsiniz.',
        call: 'Bizi arayın',
        email: 'E-posta gönderin',
        alternate: 'English',
        alternatePath: '/en/',
      }
    : {
        language: 'en',
        label: 'WEBSITE MAINTENANCE',
        title: 'A short pause. The same pressure',
        message:
          'We’re updating our website. Our team is still available to discuss your equipment and project requirements.',
        call: 'Call our team',
        email: 'Email us',
        alternate: 'Türkçe',
        alternatePath: '/tr/',
      };
  const body = `<!doctype html><html lang="${text.language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TECHNICSAN · ${text.label}</title><meta name="robots" content="noindex,follow"><style>
*{box-sizing:border-box}body{margin:0;background:#073526;color:#f0f1e9;font-family:Arial,sans-serif;line-height:1.6;min-height:100svh;display:grid;grid-template-rows:auto 1fr auto}header{background:#fff;padding:22px clamp(24px,6vw,90px);display:flex;align-items:center;justify-content:space-between;gap:24px}header img{display:block;width:min(260px,58vw);height:auto}a{color:inherit;text-underline-offset:5px}header a{color:#073526;font-size:14px}main{width:min(980px,100%);margin:auto;padding:72px 24px 80px}main::before{content:'';display:block;width:70px;height:8px;background:#9bc900;margin-bottom:42px;transform:skewX(-25deg)}.eyebrow{font-size:11px;letter-spacing:.2em;color:#c6df83;font-weight:700}h1{font-size:clamp(40px,6vw,76px);line-height:1.08;letter-spacing:-.045em;max-width:850px;margin:24px 0}p{max-width:600px;color:#cbd8cb;font-size:18px}nav{display:flex;flex-wrap:wrap;gap:16px;margin-top:34px}nav a{padding:14px 22px;min-height:48px;border:1px solid #6e8d77;text-decoration:none}nav a:first-child{color:#073526;background:#9bc900;border-color:#9bc900}a:focus-visible{outline:3px solid #d1ec8f;outline-offset:5px}header a:focus-visible{outline-color:#073526}.details{display:flex;flex-wrap:wrap;gap:12px 28px;margin-top:28px;font-size:14px}footer{border-top:1px solid #42614c;padding:24px;color:#b7cbb9;font-size:11px;letter-spacing:.09em;text-align:center}@media(prefers-reduced-motion:no-preference){main{animation:arrive .5s ease-out}@keyframes arrive{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}@media(max-width:480px){header{padding:20px}main{padding:48px 24px}nav{display:grid}nav a{text-align:center}.details{display:grid}p{font-size:16px}}
</style></head><body><header><img src="/brand/technicsan-white-480.webp" width="480" height="94" alt="TECHNICSAN"><a href="${text.alternatePath}" lang="${tr ? 'en' : 'tr'}">${text.alternate}</a></header><main><span class="eyebrow">${text.label}</span><h1>${text.title}</h1><p>${text.message}</p><nav aria-label="${tr ? 'İletişim' : 'Contact'}"><a href="tel:+905327122417">${text.call}</a><a href="mailto:info@technicsan.com">${text.email}</a><a href="https://wa.me/905327122417">WhatsApp</a></nav><div class="details"><a href="tel:+905327122417">+90 532 712 24 17</a><a href="mailto:info@technicsan.com">info@technicsan.com</a></div></main><footer>OUR PRESSURE. YOUR TREASURE.</footer></body></html>`;
  return new Response(request.method === 'HEAD' ? null : body, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Language': text.language,
      'Cache-Control': 'no-store, max-age=0',
      'Retry-After': '3600',
      'X-Robots-Tag': 'noindex, follow',
      'X-Technicsan-Status': 'maintenance',
    },
  });
}
