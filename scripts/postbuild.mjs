import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import delivery from '../src/data/enquiry-delivery.json' with { type: 'json' };
import sanity from '../src/data/sanity.json' with { type: 'json' };
import { createSecurityHeaders } from '../deployment/cloudflare/worker.mjs';
try {
  process.loadEnvFile();
} catch {}
const live = process.env.PUBLIC_LAUNCH_READY === 'true';
const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
const base = '/' + (process.env.PUBLIC_BASE_PATH || '').split('/').filter(Boolean).join('/');
const hostedOnGitHub = process.env.PUBLIC_HOSTING === 'github-pages';
if (
  live &&
  (hostedOnGitHub || process.env.PUBLIC_ENQUIRY_PROVIDER === 'formspree') &&
  !/^[a-z0-9]{6,32}$/.test(process.env.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId ?? '')
)
  throw new Error('Live static hosting requires a configured Formspree endpoint.');
if (live && !['github-pages', 'cloudflare'].includes(process.env.PUBLIC_HOSTING || ''))
  throw new Error('Live builds require explicit production hosting.');
if (
  live &&
  (!site.startsWith('https://') ||
    !['repository', 'sanity'].includes(process.env.CONTENT_SOURCE || '') ||
    process.env.SANITY_PREVIEW === 'true')
)
  throw new Error(
    'Live builds require an HTTPS domain and approved repository or published Sanity content.',
  );
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
// Development experiments must never be shipped, even in review-mode deployments.
await rm('dist/design', { recursive: true, force: true });
const files = await walk('dist');
const xml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const urls = [];
const redirects = [];
const inlineScriptHashes = new Set();
for (const file of files.filter((f) => f.endsWith('.html'))) {
  let html = await readFile(file, 'utf8');
  // Astro inlines small modules. Authorize their exact contents without unsafe-inline.
  for (const [, attributes, source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!source.trim() || /\bsrc\s*=|application\/ld\+json/.test(attributes)) continue;
    inlineScriptHashes.add(`'sha256-${createHash('sha256').update(source).digest('base64')}'`);
  }
  const redirect = html.match(/http-equiv="refresh" content="0;url=([^\"]+)"/);
  if (redirect && file !== 'dist/index.html') {
    // Legacy route names remain technical aliases; never repeat retired supplier names in the page body.
    html = html.replace(
      /<body>[\s\S]*<\/body>/,
      `<body><a href="${redirect[1]}">Continue to TECHNICSAN</a></body>`,
    );
    await writeFile(file, html);
    const from =
      (base === '/' ? '' : base) + '/' + file.replace(/^dist\//, '').replace(/index\.html$/, '');
    redirects.push(`${from} ${redirect[1]} 301`);
  }
  if (html.includes('content="index,follow"')) {
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical) {
      const alternates = [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
        .map((m) => `<xhtml:link rel="alternate" hreflang="${xml(m[1])}" href="${xml(m[2])}"/>`)
        .join('');
      urls.push(`<url><loc>${xml(canonical)}</loc>${alternates}</url>`);
    }
  }
}
if (live && !urls.length) throw new Error('Search release blocked: no approved indexable pages.');
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
const securityHeaders = createSecurityHeaders([...inlineScriptHashes]);
await writeFile(
  'dist/_headers',
  '/*\n' +
    Object.entries(securityHeaders)
      .map(([name, value]) => `  ${name}: ${value}\n`)
      .join('') +
    (live ? '' : '  X-Robots-Tag: noindex, follow\n'),
);
if (
  process.env.PUBLIC_HOSTING === 'cloudflare' &&
  process.env.PUBLIC_ENQUIRY_PROVIDER === 'formspree'
) {
  const source = await readFile('deployment/cloudflare/worker.mjs', 'utf8');
  const aliases = Object.fromEntries(redirects.map((line) => line.split(' ').slice(0, 2)));
  await writeFile(
    'dist/_worker.js',
    source
      .replace('/*__TECHNICSAN_SEARCH_RELEASE__*/ false', String(live))
      .replace('/*__TECHNICSAN_ALIASES__*/ {}', JSON.stringify(aliases))
      .replace('/*__TECHNICSAN_AVAILABILITY__*/ {}', JSON.stringify(sanity))
      .replace('/*__TECHNICSAN_SCRIPT_HASHES__*/ []', JSON.stringify([...inlineScriptHashes])),
  );
  await writeFile(
    'dist/availability.mjs',
    await readFile('deployment/cloudflare/availability.mjs', 'utf8'),
  );
  await writeFile(
    'dist/_routes.json',
    JSON.stringify({
      version: 1,
      include: ['/*'],
      exclude: ['/_astro/*', '/images/*', '/brand/*', '/icons/*', '/favicon.svg'],
    }),
  );
} else {
  await rm('dist/_worker.js', { force: true });
  await rm('dist/_routes.json', { force: true });
}
await writeFile(
  'dist/_redirects',
  '/ ' + (base === '/' ? '' : base) + '/en/ 302\n' + redirects.join('\n') + '\n',
);
if (hostedOnGitHub) {
  await writeFile('dist/.nojekyll', '');
  const { unlink } = await import('node:fs/promises');
  for (const file of ['dist/_headers', 'dist/_redirects']) await unlink(file);
}
console.log(
  `Postbuild: ${files.filter((f) => f.endsWith('.html')).length} pages; ${urls.length} indexable URLs; ${live ? 'live' : 'preview'} mode.`,
);
