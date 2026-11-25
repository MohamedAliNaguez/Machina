import { test, expect } from '@playwright/test';

test('LPG source products have working bilingual routes, reference photos and quote context', async ({
  page,
}) => {
  await page.goto('/en/categories/lpg-catalog/');
  await expect(page.locator('[data-machine-card]')).toHaveCount(7);
  expect(
    await page
      .locator('[data-machine-card]')
      .evaluateAll((cards) => cards.map((card) => card.getAttribute('data-id'))),
  ).toEqual([
    'lpg-semi-trailer',
    'lpg-bobtail',
    'lpg-dispenser-skid-system',
    'lpg-scale-skid-system',
    'lpg-bulk-storage-tank',
    'lpg-domestic-tank',
    'lpg-vaporiser',
  ]);
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
  const secondPhoto = page.getByRole('button', { name: 'Photo 2', exact: true });
  const selectedDescription = await secondPhoto.getAttribute('data-photo-alt');
  await secondPhoto.click();
  await expect(page.locator('[data-product-caption]')).toHaveText(selectedDescription!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Request a quote', exact: true }).last().click();
  await expect(page.getByLabel('Product of interest')).toHaveValue('lpg-bulk-storage-tank');
});
