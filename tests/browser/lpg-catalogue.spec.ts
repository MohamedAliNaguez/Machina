import { test, expect } from '@playwright/test';

test('LPG source products have working bilingual routes, reference photos and quote context', async ({
  page,
}) => {
  await page.goto('/en/categories/lpg-catalog/');
  await expect(page.locator('[data-machine-card]')).toHaveCount(7);
  for (const slug of [
    'lpg-dispenser-skid-system',
    'lpg-scale-skid-system',
    'lpg-bulk-storage-tank',
    'lpg-domestic-tank',
    'lpg-vaporiser',
  ]) {
    await page.goto(`/en/products/${slug}/`);
    await expect(page.locator('.pressure-preview-note')).toContainText('review');
    if (slug === 'lpg-dispenser-skid-system') {
      await expect(page.locator('#product-main-image')).toBeVisible();
      await expect(page.locator('[data-product-photo]')).toHaveCount(0);
    } else {
      expect(await page.locator('[data-product-photo]').count()).toBeGreaterThan(1);
    }
    await page.getByRole('link', { name: 'TR', exact: true }).click();
    await expect(page).toHaveURL(`/tr/urunler/${slug}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/products/lpg-bulk-storage-tank/');
  await page.getByRole('button', { name: 'Photo 2', exact: true }).click();
  await expect(page.locator('[data-product-caption]')).toContainText('view 2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Request a quote', exact: true }).last().click();
  await expect(page.getByLabel('Product of interest')).toHaveValue('lpg-bulk-storage-tank');
});
