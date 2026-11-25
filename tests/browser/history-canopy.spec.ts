import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop branches animate automatically without motion buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/en/about/');
  await expect(page.locator('[data-site-loader]')).toBeHidden();
  const root = page.locator('[data-living-canopy]');
  await expect(root).toHaveAttribute('data-enhanced', 'true');
  await expect(root).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('canvas.living-branch-canvas')).toHaveCount(1);
  await expect(page.locator('[data-canopy-limb]')).toHaveCount(7);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const branch = page.locator('[data-canopy-stem="0"] [data-surface]');
  const initial = await branch.getAttribute('d');
  await expect.poll(() => branch.getAttribute('d')).not.toBe(initial);
  await expect(page.locator('.living-motion-controls')).toHaveCount(0);
  await expect(root).toHaveAttribute('data-progress', '1.0000', { timeout: 15000 });
  await expect(page.locator('[data-canopy-limb="6"]')).toHaveAttribute('data-growth', '1.000');
  expect(requests.some((url) => url.includes('canopy-desktop-approved.png'))).toBe(false);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/history-desktop.png' });
  await page.getByRole('link', { name: /1992.*Compressors/i }).click();
  await expect(page).toHaveURL(/#history-compressors$/);
});

test('Turkish mobile reduced motion uses full geometry with no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/tr/hakkimizda/');
  await expect(page.locator('[data-living-canopy]')).toHaveAttribute('data-animation', 'reduced');
  await expect(page.locator('[data-living-canopy]')).toHaveAttribute('data-progress', '1.0000');
  await expect(page.locator('[data-canopy-replay]')).toBeHidden();
  await expect(page.locator('.history-reading-list')).toContainText('Kompresör üretimi');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/history-mobile.png', fullPage: true });
  expect(requests.some((url) => /canopy-webgl|three\.module|trunk-skin/.test(url))).toBe(false);
});

test('mobile branches animate automatically', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/about/');
  await expect(page.locator('[data-site-loader]')).toBeHidden();
  const branch = page.locator('[data-canopy-stem="0"] [data-surface]');
  const initial = await branch.getAttribute('d');
  await expect.poll(() => branch.getAttribute('d')).not.toBe(initial);
  await expect(page.locator('.living-motion-controls')).toHaveCount(0);
});

test('complete vector scene and HTML history work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/about/');
  await expect(page.locator('.history-reading-list li')).toHaveCount(7);
  await expect(page.locator('.history-reading-list')).toContainText('Compressor production begins');
  const path = await page.locator('[data-canopy-limb="6"] [data-surface]').getAttribute('d');
  expect(path?.length).toBeGreaterThan(100);
  await expect(page.locator('.living-storyboard')).toHaveCount(0);
  await context.close();
});

test('animated vector branches remain usable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto('/en/about/');
  await expect(page.locator('[data-site-loader]')).toBeHidden();
  await expect(page.locator('[data-living-canopy]')).toHaveAttribute('data-renderer', 'svg');
  const branch = page.locator('[data-canopy-stem="0"] [data-surface]');
  const initial = await branch.getAttribute('d');
  await expect.poll(() => branch.getAttribute('d')).not.toBe(initial);
});
