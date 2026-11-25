import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

test('released output lists only approved pages; preview and design routes remain excluded', () => {
  const folder = mkdtempSync(join(tmpdir(), 'technicsan-seo-'));
  const script = resolve('scripts/postbuild.mjs');
  const site = 'https://technicsan.com';
  const families = ['cement-bulker', 'lpg-catalog', 'compressors', 'mixers', 'silos'];
  const pages = ['', 'about/', 'contact/', ...families.map((f) => `categories/${f}/`)];
  const write = (path: string, html: string) => {
    const file = join(folder, 'dist', path, 'index.html');
    mkdirSync(resolve(file, '..'), { recursive: true });
    writeFileSync(file, html);
  };
  const render = (live: boolean) => {
    for (const locale of ['en', 'tr'])
      for (const page of pages) {
        const canonical = `${site}/${locale}/${page}`;
        const other = `${site}/${locale === 'en' ? 'tr' : 'en'}/${page}`;
        write(
          `${locale}/${page}`,
          `<html><head><link rel="canonical" href="${canonical}"><meta name="robots" content="${live ? 'index' : 'noindex'},follow">${live ? `<link rel="alternate" hreflang="${locale}" href="${canonical}"><link rel="alternate" hreflang="${locale === 'en' ? 'tr' : 'en'}" href="${other}"><link rel="alternate" hreflang="x-default" href="${site}/en/${page}">` : ''}</head></html>`,
        );
      }
    write(
      'en/products/',
      '<meta name="robots" content="noindex,follow"><link rel="canonical" href="https://technicsan.com/en/products/">',
    );
    write(
      'en/products/pending-unit/',
      '<meta name="robots" content="noindex,follow"><link rel="canonical" href="https://technicsan.com/en/products/pending-unit/">',
    );
    write('design/loaders/', '<title>Development only</title>');
  };
  try {
    for (const live of [true, false]) {
      render(live);
      const result = spawnSync(process.execPath, [script], {
        cwd: folder,
        encoding: 'utf8',
        env: {
          ...process.env,
          PUBLIC_LAUNCH_READY: String(live),
          PUBLIC_SITE_URL: site,
          CONTENT_SOURCE: 'sanity',
          PUBLIC_HOSTING: 'github-pages',
          PUBLIC_BASE_PATH: '/',
        },
      });
      assert.equal(result.status, 0, result.stderr);
      const sitemap = readFileSync(join(folder, 'dist/sitemap.xml'), 'utf8');
      assert.equal([...sitemap.matchAll(/<loc>/g)].length, live ? 16 : 0);
      assert.ok(!sitemap.includes('/products/'));
      assert.ok(!existsSync(join(folder, 'dist/design')));
      const robots = readFileSync(join(folder, 'dist/robots.txt'), 'utf8');
      assert.ok(robots.includes(live ? 'Allow: /\n' : 'Disallow: /\n'));
      if (live) assert.ok(sitemap.includes('hreflang="x-default"'));
    }
  } finally {
    const target = resolve(folder);
    if (
      !target.startsWith(resolve(tmpdir()) + sep) ||
      !target.split(sep).at(-1)?.startsWith('technicsan-seo-')
    )
      throw new Error('Unsafe temporary cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
});
