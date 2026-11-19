import { test, expect, type Page } from '@playwright/test';

// Exercise the hosted delivery mode without contacting the real sales inbox in CI.
async function hostedForm(page: Page, language: 'en' | 'tr') {
  const section = language === 'en' ? 'contact' : 'iletisim';
  await page.route(`**/${language}/${section}/**`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace('data-delivery="local"', 'data-delivery="formspree"')
      .replace(/action="[^"]*"/, 'action="https://formspree.io/f/testform"');
    await route.fulfill({ response, body });
  });
  await page.goto(`/${language}/${section}/?product=v-type-silobas`);
}

test('hosted sales enquiries validate and submit product details without a local API request', async ({
  page,
}) => {
  const requests: Record<string, string>[] = [];
  await page.route('https://formspree.io/f/testform', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await hostedForm(page, 'en');
  await expect(page.getByLabel('Country calling code')).toHaveValue('TR');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('[aria-invalid="true"]').first()).toBeFocused();
  expect(requests).toHaveLength(0);
  await page.getByLabel('Name *').fill('Website integration test');
  await page.getByLabel('Email', { exact: true }).fill('buyer@example.test');
  await page.getByLabel('Message *').fill('Please provide the available product configurations.');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('Your enquiry has been received');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    email: 'buyer@example.test',
    phone: '',
    machineId: 'v-type-silobas',
    language: 'en',
  });
  expect(requests[0].product).toBe('V-type cement bulker');
  expect(requests[0]._subject).toContain('TECHNICSAN');
  expect(requests[0].reference).toMatch(/^[a-f0-9-]{36}$/i);
  await expect(page.getByLabel('Name *')).toHaveValue('');
});

test('hosted failures preserve a Turkish phone-only enquiry and its retry reference', async ({
  page,
}) => {
  const requests: Record<string, string>[] = [];
  await page.route('https://formspree.io/f/testform', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: requests.length === 1 ? 429 : 200,
      json: requests.length === 1 ? { error: 'limit' } : { ok: true },
    });
  });
  await hostedForm(page, 'tr');
  await page.getByLabel('Adınız *').fill('Örnek alıcı');
  await page.getByLabel('Ülke telefon kodu').selectOption('GB');
  await page.getByLabel('Telefon', { exact: true }).fill('020 7946 0958');
  await page.getByLabel('Mesajınız *').fill('Ürün seçenekleri hakkında bilgi almak istiyorum.');
  await page.getByRole('button', { name: 'Talep gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Çok fazla deneme');
  await expect(page.getByLabel('Adınız *')).toHaveValue('Örnek alıcı');
  await expect(page.getByLabel('Ülke telefon kodu')).toHaveValue('GB');
  await expect(page.getByLabel('Telefon', { exact: true })).toHaveValue('020 7946 0958');
  await expect(page.getByLabel('Mesajınız *')).toHaveValue(
    'Ürün seçenekleri hakkında bilgi almak istiyorum.',
  );
  await page.getByRole('button', { name: 'Talep gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Talebiniz kaydedildi');
  expect(requests).toHaveLength(2);
  expect(requests[0]).not.toHaveProperty('email');
  expect(requests[1].reference).toBe(requests[0].reference);
  expect(requests[1].language).toBe('tr');
  expect(requests[1].phone).toBe('+442079460958');
  await expect(page.getByLabel('Ülke telefon kodu')).toHaveValue('TR');
});

test('pasted international numbers update the country selector without doubling the prefix on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: Record<string, string>[] = [];
  await page.route('https://formspree.io/f/testform', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await hostedForm(page, 'en');
  expect(await page.getByLabel('Country calling code').locator('option').count()).toBeGreaterThan(
    200,
  );
  await page.getByLabel('Name *').fill('Example buyer');
  await page.getByLabel('Phone', { exact: true }).fill('+1 416 555 0123');
  await page.getByLabel('Message *').fill('Please send the product information.');
  await expect(page.getByLabel('Country calling code')).toHaveValue('CA');
  await expect(page.getByLabel('Phone', { exact: true })).toHaveValue('4165550123');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .locator('.phone-input-group')
    .screenshot({ path: 'test-results/phone-country-mobile.png' });
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('Your enquiry has been received');
  expect(requests[0].phone).toBe('+14165550123');
});
