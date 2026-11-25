import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
try {
  process.loadEnvFile();
} catch {}
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
      ),
    )
  ).flat();
}
const files = (await walk('dist')).filter((file) => file.endsWith('.html'));
const documents = new Map(
  await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
);
const origin = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
const base = '/' + (process.env.PUBLIC_BASE_PATH || '').split('/').filter(Boolean).join('/');
const stripBase = (path) =>
  base !== '/' && path.startsWith(base + '/') ? path.slice(base.length) : path;
let checkedLinks = 0;
const indexed = new Set();
assert.ok(
  !files.some((file) => file.startsWith('dist/design/')),
  'Design review routes shipped to production',
);
const rootHtml = documents.get('dist/index.html');
assert.ok(rootHtml?.includes('/en/'), 'The domain root must lead to English');
for (const [file, html] of documents) {
  assert.match(html, /<title>.+<\/title>/, `Title missing: ${file}`);
  if (file === 'dist/index.html') continue;
  const redirect = html.match(/http-equiv="refresh" content="0;url=([^\"]+)"/);
  if (redirect) {
    const target = new URL(redirect[1], origin);
    const pathname = stripBase(target.pathname);
    const destination = `dist${pathname.endsWith('/') ? pathname : pathname + '/'}index.html`;
    assert.equal(target.origin, new URL(origin).origin, `External redirect: ${file}`);
    assert.ok(documents.has(destination), `Missing redirect destination: ${file}`);
    assert.notEqual(destination, file, `Self redirect: ${file}`);
    assert.ok(
      html.includes(`rel="canonical" href="${target.href}"`),
      `Redirect canonical missing: ${file}`,
    );
    assert.match(html, /name="robots" content="noindex"/, `Redirect is indexable: ${file}`);
    checkedLinks++;
    continue;
  }
  assert.match(html, /name="description"/, `Description missing: ${file}`);
  for (const heading of html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) {
    assert.doesNotMatch(heading[1], /<script\b/i, `Executable script inside page heading: ${file}`);
  }
  assert.doesNotMatch(
    html,
    /tedsan|confidence|ünal|unal-|nt[ -]?makin|gaslin|tricon|blackmer/i,
    `Third-party company name in public page: ${file}`,
  );
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical, `Canonical missing: ${file}`);
  assert.equal(new URL(canonical).origin, new URL(origin).origin, `Wrong canonical host: ${file}`);
  const isIndexed = /name="robots" content="index,follow"/.test(html);
  if (isIndexed) indexed.add(canonical);
  if (/dist\/(en\/products|tr\/urunler)\/index.html$/.test(file))
    assert.ok(!isIndexed, `Interactive catalogue must stay noindex: ${file}`);
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
    JSON.parse(script[1]);
  for (const link of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const deployedPath = new URL(link[1].replace(/&amp;/g, '&'), origin).pathname;
    if (base !== '/')
      assert.ok(
        deployedPath.startsWith(base + '/'),
        `Unprefixed repository URL from ${file}: ${deployedPath}`,
      );
    const pathname = stripBase(deployedPath);
    const target = `dist${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`;
    assert.ok(await stat(target).catch(() => false), `Broken link from ${file}: ${pathname}`);
    checkedLinks++;
  }
  for (const link of html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) {
    const pathname = stripBase(new URL(link[2]).pathname);
    const other = documents.get(
      pathname === '/404/' || pathname === '/404.html'
        ? 'dist/404.html'
        : `dist${pathname.endsWith('/') ? pathname : `${pathname}/`}index.html`,
    );
    assert.ok(other, `Missing alternate: ${link[2]}`);
    assert.match(
      other,
      /name="robots" content="index,follow"/,
      `Alternate points to an excluded page: ${file}`,
    );
    if (link[1] !== 'x-default')
      assert.ok(other.includes(`href="${canonical}"`), `Non-reciprocal language link: ${file}`);
  }
  if (process.env.PUBLIC_LAUNCH_READY !== 'true')
    assert.match(html, /content="noindex,follow"/, `Preview is indexable: ${file}`);
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const listed = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&')),
);
assert.deepEqual(listed, indexed, 'Sitemap must contain exactly the indexable canonical URLs');
const robots = await readFile('dist/robots.txt', 'utf8');
assert.ok(
  process.env.PUBLIC_LAUNCH_READY === 'true'
    ? robots.includes('Allow: /\n') && !robots.includes('Disallow: /\n')
    : robots.includes('Disallow: /\n'),
  'Crawl rules do not match release mode',
);
console.log(
  `Built-site verification passed: ${files.length} pages, ${checkedLinks} internal link/asset references, valid JSON-LD and reciprocal language links.`,
);
