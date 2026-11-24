import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('photo-first product page opens the honest inspection fallback and restores focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const modelRequests: string[] = [];
  page.on('request', (request) => {
    if (/\.glb(?:\?|$)|model-viewer/.test(request.url())) modelRequests.push(request.url());
  });
  await page.goto('/en/products/v-type-silobas/');
  await expect(page.locator('.pressure-product-gallery button')).toHaveCount(2);
  const secondPhoto = page.getByRole('button', { name: 'Photo 2', exact: true });
  const secondPhotoUrl = await secondPhoto.getAttribute('data-product-photo');
  await secondPhoto.click();
  await expect(page.locator('#product-main-image')).toHaveAttribute('src', secondPhotoUrl!);
  await expect(page.locator('[data-product-caption]')).toContainText('side profile');
  await expect(page.locator('[data-inspection-open]')).toHaveCount(0);
  await page.goto('/design/inspection/');
  const open = page.getByRole('button', { name: 'Explore in 3D', exact: true });
  await open.click();
  const studio = page.getByRole('dialog', { name: 'TECHNICSAN / 3D STUDIO', exact: true });
  await expect(studio).toBeVisible();
  await expect(studio.getByText('Awaiting an approved 3D model', { exact: true })).toBeVisible();
  await expect(studio.getByRole('button', { name: 'Orbit', exact: true })).toBeDisabled();
  await studio.getByRole('button', { name: '02 Hose routing', exact: true }).click();
  await expect(studio.locator('[data-inspection-point-title]')).toHaveText('Hose routing');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/inspection-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(studio).toBeHidden();
  await expect(open).toBeFocused();
  expect(modelRequests).toEqual([]);
});

test('mobile Turkish inspection and horizontal family filters remain accessible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tr/urunler/');
  await page.getByRole('checkbox', { name: 'Kompresörler', exact: true }).check();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'Tüm ürünler', exact: true }).click();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(14);
  await page.goto('/design/inspection-tr/');
  await page.getByRole('button', { name: '3D olarak inceleyin', exact: true }).click();
  await expect(page.locator('[data-product-inspection]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/inspection-mobile.png' });
  await page.getByRole('button', { name: 'Fotoğraflara dönün', exact: true }).click();
  await expect(page.locator('[data-product-inspection]')).toBeHidden();
});
