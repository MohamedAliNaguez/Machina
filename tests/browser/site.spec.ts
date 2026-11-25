import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('bilingual product routes and the five-type catalogue filters work', async ({ page }) => {
  await page.goto('/en/products/bnb-72-e/');
  await page.getByRole('link', { name: 'TR', exact: true }).click();
  await expect(page).toHaveURL('/tr/urunler/bnb-72-e/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.goto('/en/products/?category=cement-bulker,lpg-catalog');
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(8);
  await expect(page.locator('[data-filter="category"]')).toHaveCount(5);
  await page.getByRole('searchbox').fill('no-such-model');
  await expect(
    page.getByRole('heading', { name: 'No products match these filters' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(8);
  await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click();
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(14);
  await page.getByRole('checkbox', { name: 'Compressors', exact: true }).check();
  await page.getByRole('link', { name: 'TR', exact: true }).click();
  await expect(page).toHaveURL(/\/tr\/urunler\/\?category=compressors$/);
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(2);
});
test('enquiry validates, saves locally and never claims an email was sent', async ({ page }) => {
  // Exercise the secure-random fallback for browsers/origins without randomUUID().
  await page.addInitScript(() => {
    Object.defineProperty(Crypto.prototype, 'randomUUID', { value: undefined, configurable: true });
  });
  await page.goto('/en/contact/?product=v-type-silobas');
  await expect(page.getByLabel('Product of interest')).toHaveValue('v-type-silobas');
  await expect(page.getByRole('link', { name: 'TR', exact: true })).toHaveAttribute(
    'href',
    /product=v-type-silobas/,
  );
  await page.getByRole('button', { name: 'Remove product', exact: true }).click();
  await expect(page.getByRole('link', { name: 'TR', exact: true })).not.toHaveAttribute(
    'href',
    /product=/,
  );
  await page.getByLabel('Product of interest').selectOption('v-type-silobas');
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

test('curated catalogue preserves filter/search language state and excludes archived products', async ({
  page,
}) => {
  await page.goto('/en/products/?category=lpg-catalog&page=2');
  await expect(page.locator('[data-results-count]')).toContainText('7 results');
  await expect(page).not.toHaveURL(/page=/);
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'TR', exact: true }).click();
  await expect(page).toHaveURL(/category=lpg-catalog$/);
  await page.getByRole('searchbox').fill('bobtail');
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-machine-card]:visible')).toHaveAttribute(
    'data-id',
    'lpg-bobtail',
  );
  const response = await page.goto('/en/products/lpg-part-10/');
  expect(response?.status()).toBe(404);
});

test('source gallery, configurations, product quote context and mobile tables work', async ({
  page,
}) => {
  await page.goto('/en/products/wet-system/');
  await expect(
    page.getByRole('heading', { name: 'Wet System Truck Mixer', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Model configurations', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.product-reference')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Request a quote', exact: true }).last().click();
  await expect(page.getByLabel('Product of interest')).toHaveValue('wet-system');
  await page.goto('/en/products/v-type-silobas/');
  const secondPhoto = page.getByRole('button', { name: 'Photo 2', exact: true });
  const target = await secondPhoto.getAttribute('data-product-photo');
  await secondPhoto.click();
  await expect(page.locator('#product-main-image')).toHaveAttribute('src', target!);
  await expect(secondPhoto).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/en/products/nt-wet-system/');
  await expect(page).toHaveURL('/en/products/wet-system/');
  await page.goto('/en/products/silos/');
  await expect(page).toHaveURL('/en/categories/silos/');
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
    '/tr/urunler/',
    '/en/products/bnb-72-e/',
    '/en/products/wet-system/',
    '/tr/urunler/lpg-bobtail/',
    '/en/contact/',
    '/tr/rehberler/',
    '/en/categories/cement-bulker/',
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
test('preview metadata, source photographs, attribution and desktop screenshot', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'TR', exact: true })).toHaveAttribute(
    'href',
    /\/tr\/$/,
  );
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
  // Capture the website after its first-visit introduction, rather than the overlay.
  await expect(page.locator('[data-site-loader]')).toBeHidden();
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'test-results/preview-desktop.png', fullPage: false });
  await page.goto('/en/products/lpg-bobtail/');
  await expect(page.locator('[data-product-photo]')).toHaveCount(12);
  const primaryImageDescription = await page.locator('#product-main-image').getAttribute('alt');
  await expect(page.locator('[data-product-caption]')).toHaveText(primaryImageDescription!);
  await expect(page.locator('.pressure-preview-note')).toContainText('approval pending');
  await expect(page.locator('script[type="application/ld+json"]')).not.toContainText(
    '"@type":"Product"',
  );
  await page.goto('/en/products/');
  await expect(page.locator('[data-machine-card]:visible')).toHaveCount(14);
  await page.screenshot({ path: 'test-results/catalogue-desktop.png', fullPage: false });
});
