import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('bilingual navigation preserves the machine page and used filters work', async ({ page }) => {
  await page.goto('/en/machines/ex140/');
  await page.getByRole('link', { name: 'TR', exact: true }).click();
  await expect(page).toHaveURL('/tr/makineler/ex140/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.goto('/en/machines/?kind=used&year=2021&hours=5000');
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(4);
  await page.getByRole('searchbox').fill('no-such-model');
  await expect(
    page.getByRole('heading', { name: 'No machines match these filters' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(12);
});
test('enquiry validates, saves locally and never claims an email was sent', async ({ page }) => {
  await page.goto('/en/contact/?machine=ex210');
  await expect(page.getByLabel('Machine of interest')).toHaveValue('ex210');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('[aria-invalid="true"]').first()).toBeFocused();
  await page.getByLabel('Name *').fill('Sample browser test');
  await page.getByLabel('Email', { exact: true }).fill('browser@example.test');
  await page
    .getByLabel('Message *')
    .fill('This is a sample equipment enquiry for browser testing.');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('saved to the local preview');
});
test('network failure preserves the form and retry remains possible', async ({ page }) => {
  await page.goto('/tr/iletisim/');
  await page.getByLabel('Adınız *').fill('Örnek alıcı');
  await page.getByLabel('E-posta', { exact: true }).fill('example@example.test');
  await page.getByLabel('Mesajınız *').fill('Yerel geliştirme için örnek makine talebi.');
  await page.route('**/api/enquiries', (route) => route.abort());
  await page.getByRole('button', { name: 'Talep gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Bilgileriniz korunuyor');
  await expect(page.getByLabel('Adınız *')).toHaveValue('Örnek alıcı');
  await expect(page.getByRole('button', { name: 'Talep gönder' })).toBeEnabled();
});
test('mobile navigation, no overflow and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
});
test('representative pages have no serious accessibility violations', async ({ page }) => {
  for (const path of [
    '/en/',
    '/tr/makineler/',
    '/en/machines/ex140/',
    '/en/contact/',
    '/tr/rehberler/',
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});
test('preview metadata, image loading, sold state and desktop screenshot', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await expect(page.locator('link[hreflang="tr"]')).toHaveAttribute('href', /\/tr\/$/);
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images
          .filter((image) => image.loading !== 'lazy')
          .every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true);
  await page
    .locator('img')
    .evaluateAll((images) => images.forEach((image) => (image.loading = 'eager')));
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBe(true);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'test-results/preview-desktop.png', fullPage: false });
  await page.goto('/en/machines/wl200/');
  await expect(page.getByRole('link', { name: 'Browse alternatives' })).toBeVisible();
});
