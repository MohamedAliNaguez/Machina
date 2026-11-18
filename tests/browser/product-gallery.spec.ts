import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('enlarged product gallery slides, wraps and returns to the selected product photo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/products/silos-1000-2000/');
  await page.getByRole('button', { name: 'Photo 2', exact: true }).click();
  const opener = page.getByRole('link', { name: /Enlarge image$/ });
  const photo2 = await page.locator('#product-main-image').getAttribute('src');
  const url = page.url();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('2 / 2');
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(dialog).toHaveAttribute('data-zoomed', 'true');
  const canvas = await dialog.locator('[data-gallery-stage]').boundingBox();
  const startingTransform = await dialog
    .locator('[data-gallery-view]')
    .evaluate((image) => image.style.transform);
  await page.mouse.move(canvas!.x + canvas!.width / 2, canvas!.y + canvas!.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas!.x + canvas!.width / 2 + 70, canvas!.y + canvas!.height / 2 + 35, {
    steps: 5,
  });
  await page.mouse.up();
  expect(
    await dialog.locator('[data-gallery-view]').evaluate((image) => image.style.transform),
  ).not.toBe(startingTransform);
  await dialog.getByRole('button', { name: 'Fit image', exact: true }).click();
  await expect(dialog).not.toHaveAttribute('data-zoomed', 'true');
  await expect(dialog.locator('[data-gallery-view]')).toHaveAttribute('src', photo2!);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('1 / 2');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('2 / 2');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/product-lightbox-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.locator('#product-main-image')).toHaveAttribute('src', photo2!);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('Turkish mobile gallery supports swiping, thumbnails and closing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tr/urunler/silos-1000-2000/');
  await page.getByRole('link', { name: /Görseli büyüt$/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('1 / 2');
  await expect(dialog.locator('[data-gallery-outgoing]')).toBeHidden();
  const stage = dialog.locator('[data-gallery-stage]');
  await stage.dispatchEvent('pointerdown', {
    pointerType: 'touch',
    isPrimary: true,
    clientX: 300,
    clientY: 350,
  });
  await stage.dispatchEvent('pointerup', {
    pointerType: 'touch',
    isPrimary: true,
    clientX: 90,
    clientY: 355,
  });
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('2 / 2');
  await dialog.getByRole('button', { name: 'Fotoğrafı görüntüle 1', exact: true }).click();
  await expect(dialog.locator('[data-gallery-count]')).toHaveText('1 / 2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/product-lightbox-mobile.png' });
  await dialog.getByRole('button', { name: 'Kapat', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
