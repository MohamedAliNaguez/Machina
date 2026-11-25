import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('review HTML excludes search indexing while editorial categories stay separate from filters', async ({
  page,
  request,
}) => {
  const raw = await (await request.get('/en/products/?category=lpg-catalog')).text();
  expect(raw).toContain('name="robots" content="noindex,follow"');
  await page.goto('/en/categories/lpg-catalog/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'LPG tanks, transport equipment and skid systems',
  );
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await expect(page.locator('[data-machine-card]')).toHaveCount(7);
  await expect(page.getByRole('link', { name: 'Search and filter the catalogue' })).toHaveAttribute(
    'href',
    '/en/products/?category=lpg-catalog',
  );
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
});

test('analytics waits for consent, ignores failures/previews and excludes private enquiry data', async ({
  page,
}) => {
  // Insert the inactive integration fixture locally; never contact a real analytics property.
  let analyticsRequests = 0;
  await page.route('https://www.googletagmanager.com/**', (route) => {
    analyticsRequests++;
    return route.fulfill({ body: '', contentType: 'application/javascript' });
  });
  await page.goto('/en/contact/?email=private@example.test');
  await page.evaluate(async () => {
    const root = document.createElement('aside');
    root.setAttribute('data-measurement', '');
    Object.assign(root.dataset, {
      id: 'G-TEST123',
      language: 'en',
      path: '/en/contact/',
      products: JSON.stringify({ 'v-type-silobas': 'cement-bulker' }),
    });
    root.innerHTML =
      '<div data-consent-notice hidden><button data-consent-accept>Accept test analytics</button><button data-consent-decline>Decline test analytics</button></div><button data-consent-settings hidden>Test preferences</button>';
    document.body.append(root);
    const modulePath = '/src/scripts/measurement.ts';
    const { initMeasurement } = await import(/* @vite-ignore */ modulePath);
    initMeasurement();
  });
  expect(analyticsRequests).toBe(0);
  await page.getByRole('button', { name: 'Accept test analytics' }).click();
  await expect.poll(() => analyticsRequests).toBe(1);
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('enquiry:failed', { detail: { email: 'private@example.test' } }),
    );
    window.dispatchEvent(
      new CustomEvent('enquiry:accepted', {
        detail: { preview: true, machineId: 'v-type-silobas' },
      }),
    );
  });
  const count = () =>
    page.evaluate(
      () =>
        Array.from((window as any).dataLayer || [])
          .map((entry: any) => Array.from(entry))
          .filter((entry: any) => entry[1] === 'enquiry_success').length,
    );
  expect(await count()).toBe(0);
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('enquiry:accepted', {
        detail: {
          machineId: 'v-type-silobas',
          email: 'private@example.test',
          message: 'Private message',
          phone: '+905555555555',
          language: 'en',
        },
      }),
    ),
  );
  expect(await count()).toBe(1);
  const payload = await page.evaluate(() => JSON.stringify((window as any).dataLayer));
  expect(payload).toContain('cement-bulker');
  expect(payload).not.toMatch(/private@example|Private message|905555555555|\?email=/);
  await page.getByRole('button', { name: 'Test preferences' }).click();
  await page.getByRole('button', { name: 'Decline test analytics' }).click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('enquiry:accepted', { detail: { machineId: 'v-type-silobas' } }),
    ),
  );
  expect(await count()).toBe(1);
});
