import { readdir, readFile, writeFile } from 'node:fs/promises';
try {
  process.loadEnvFile();
} catch {}
const live = process.env.PUBLIC_LAUNCH_READY === 'true';
const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
const base = '/' + (process.env.PUBLIC_BASE_PATH || '').split('/').filter(Boolean).join('/');
const hostedOnGitHub = process.env.PUBLIC_HOSTING === 'github-pages';
if (hostedOnGitHub && live)
  throw new Error(
    'GitHub Pages is configured for the static preview. A live enquiry backend is required before enabling launch mode.',
  );
if (
  live &&
  (!site.startsWith('https://') ||
    process.env.CONTENT_SOURCE !== 'sanity' ||
    process.env.SANITY_PREVIEW === 'true')
)
  throw new Error('Live builds require an HTTPS domain and published Sanity content.');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
      ),
    )
  ).flat();
}
const files = await walk('dist');
const urls = [];
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  if (html.includes('content="index,follow"')) {
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical) {
      const alternates = [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
        .map((m) => `<xhtml:link rel="alternate" hreflang="${m[1]}" href="${m[2]}"/>`)
        .join('');
      urls.push(`<url><loc>${canonical}</loc>${alternates}</url>`);
    }
  }
}
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`,
);
await writeFile(
  'dist/robots.txt',
  live
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL((base === '/' ? '' : base) + '/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n',
);
await writeFile(
  'dist/_headers',
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n${live ? '' : '  X-Robots-Tag: noindex, follow\n'}`,
);
await writeFile('dist/_redirects', '/ ' + (base === '/' ? '' : base) + '/tr/ 302\n');
if (hostedOnGitHub) {
  await writeFile('dist/.nojekyll', '');
  const { unlink } = await import('node:fs/promises');
  for (const file of ['dist/_headers', 'dist/_redirects']) await unlink(file);
}
console.log(
  `Postbuild: ${files.filter((f) => f.endsWith('.html')).length} pages; ${urls.length} indexable URLs; ${live ? 'live' : 'preview'} mode.`,
);
