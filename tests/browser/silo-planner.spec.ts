import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/en/guides/cement-silo-capacity-selection-guide/';
test('silo guide includes the complete manuscript, figures, FAQs and links to both earlier guides', async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator('h1')).toHaveText(
    'Cement Silo Capacity & Selection Guide: How to Size Storage for Your Concrete Batching Plant',
  );
  await expect(page.locator('.guide-section')).toHaveCount(18);
  await expect(page.locator('.guide-prose table')).toHaveCount(9);
  await expect(page.locator('.guide-prose figure')).toHaveCount(3);
  await expect(page.locator('#article-section-16 h3')).toHaveCount(9);
  await expect(page.locator('.guide-related-reading a')).toHaveCount(2);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="alternate"][hreflang="tr"]')).toHaveCount(0);
  for (const image of await page.locator('.guide-prose figure img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 2400),
      )
      .toBe(true);
  }
  for (const link of await page.locator('.guide-related-reading a, .guide-resource-links a').all())
    expect((await page.request.get((await link.getAttribute('href'))!)).status()).toBe(200);
  await page.goto('/en/guides/');
  await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
  await page.goto('/en/guides/cement-bulker-unloading-compressor-selection/');
  await expect(page.locator(`.guide-related-reading a[href="${path}"]`)).toBeVisible();
});
test('silo planner calculates the example, flags a volume shortfall, rejects invalid inputs and resets', async ({
  page,
}) => {
  await page.goto(path);
  const planner = page.locator('[data-silo-planner]');
  await planner.getByRole('button', { name: 'Load the article example' }).click();
  await expect(planner.locator('[data-silo-result] strong')).toHaveText('74.1 m³');
  await expect(planner.locator('[data-silo-result]')).toContainText('82.4 t');
  await expect(planner.locator('[data-silo-result]')).toContainText('2.58 operating days');
  await planner.locator('input[name="volume"]').fill('60');
  await expect(planner.locator('[data-silo-assessment]')).toContainText('falls short');
  await planner.locator('input[name="density"]').fill('0');
  await expect(planner.locator('input[name="density"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(planner.locator('[data-silo-result]')).toContainText('Check the inputs');
  await planner.getByRole('button', { name: 'Clear values' }).click();
  await expect(planner.locator('[data-silo-result]')).toHaveText('Enter all values to calculate.');
  await expect(planner.locator('input[name="density"]')).toHaveValue('');
});
test('mobile silo guide and populated planner remain accessible and contain wide tables', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  await page
    .locator('[data-site-loader]')
    .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  await expect(page.locator('.guide-outline')).not.toHaveAttribute('open');
  await page.locator('[data-silo-example]').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
});
