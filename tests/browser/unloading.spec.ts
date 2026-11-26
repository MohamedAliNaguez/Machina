import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/en/guides/cement-bulker-unloading-compressor-selection/';

test('published unloading guide preserves figures, structure, working links and review-only indexing', async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator('h1')).toHaveText(
    'Cement Bulker Unloading: Compressor Selection, Discharge Performance & Operating Costs',
  );
  await expect(page.locator('.guide-section')).toHaveCount(14);
  await expect(page.locator('.guide-prose figure')).toHaveCount(3);
  await expect(page.locator('.guide-prose table')).toHaveCount(9);
  await expect(page.locator('#article-section-12 h3')).toHaveCount(8);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(await page.locator('link[rel="alternate"][hreflang="tr"]').count()).toBe(0);
  for (const image of await page.locator('.guide-prose figure img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
    await expect(image).toHaveAttribute('alt', /.+/);
  }
  for (const link of await page
    .locator('.guide-resource-links a, .guide-related-reading a')
    .all()) {
    const response = await page.request.get((await link.getAttribute('href'))!);
    expect(response.status()).toBe(200);
  }
  await page.goto('/en/guides/');
  await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
  await page.goto('/en/guides/cement-bulker-quotation-checklist/');
  await expect(page.locator('.guide-related-reading a')).toHaveAttribute('href', path);
});

test('unloading and fleet calculators reproduce the article and handle invalid scenarios', async ({
  page,
}) => {
  await page.goto(path);
  const time = page.locator('[data-buyer-tool="unloading"]');
  await time.getByRole('button', { name: 'Load illustrative example' }).click();
  await expect(time.locator('[data-result]')).toHaveText('Assumed total time: 52.5 min');
  const fleet = page.locator('[data-buyer-tool="fleet"]');
  await fleet.getByRole('button', { name: 'Load the article example' }).click();
  await expect(fleet.locator('[data-result] strong')).toHaveText('750 h');
  await expect(fleet.locator('[data-result]')).toContainText('€13,125/year');
  await expect(fleet.locator('[data-result]')).toContainText('18.29 months');
  await fleet.locator('[name="target"]').fill('80');
  await expect(fleet.locator('[data-result]')).toContainText('cannot exceed');
  await fleet.locator('[name="target"]').fill('45');
  await fleet.locator('[name="recoverable"]').fill('0');
  await expect(fleet.locator('[data-result]')).toContainText('not calculable');
  await fleet.locator('[name="vehicles"]').fill('');
  await expect(fleet.locator('[data-result]')).toHaveText('Enter all values to calculate.');
});

test('mobile guide stays within the viewport and passes automated accessibility checks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  await expect(page.locator('.guide-outline')).not.toHaveAttribute('open');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .locator('[data-site-loader]')
    .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  const issues = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    issues.violations.map((issue) => ({
      id: issue.id,
      nodes: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});
