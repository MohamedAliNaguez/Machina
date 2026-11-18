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
  await page.getByLabel('Telefon', { exact: true }).fill('+90 532 000 00 00');
  await page.getByLabel('Mesajınız *').fill('Ürün seçenekleri hakkında bilgi almak istiyorum.');
  await page.getByRole('button', { name: 'Talep gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Çok fazla deneme');
  await expect(page.getByLabel('Adınız *')).toHaveValue('Örnek alıcı');
  await expect(page.getByLabel('Mesajınız *')).toHaveValue(
    'Ürün seçenekleri hakkında bilgi almak istiyorum.',
  );
  await page.getByRole('button', { name: 'Talep gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Talebiniz kaydedildi');
  expect(requests).toHaveLength(2);
  expect(requests[0]).not.toHaveProperty('email');
  expect(requests[1].reference).toBe(requests[0].reference);
  expect(requests[1].language).toBe('tr');
});
