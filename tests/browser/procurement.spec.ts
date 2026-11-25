import { test, expect } from '@playwright/test';
const path = '/design/guides/en/cement-bulker-quotation-checklist/';
test('procurement tools calculate screening examples, reject invalid values and explain components', async ({
  page,
}) => {
  await page.goto(path);
  const payload = page.locator('[data-buyer-tool="payload"]');
  await payload.getByRole('button', { name: 'Load illustrative example' }).click();
  await expect(payload.locator('[data-result] strong')).toHaveText('25.5 t');
  await payload.locator('input[name="fill"]').fill('101');
  await expect(payload.locator('[data-result]')).toContainText('Check the values');
  await payload.locator('input[name="fill"]').fill('90');
  const unloading = page.locator('[data-buyer-tool="unloading"]');
  await unloading.getByRole('button', { name: 'Load illustrative example' }).click();
  await expect(unloading.locator('[data-result]')).toHaveText('Assumed total time: 61 min');
  const diagram = page.locator('[data-buyer-tool="components"]');
  await diagram.locator('[data-part="3"]').click();
  await expect(diagram.locator('[data-part-description="3"]')).toBeVisible();
  await expect(diagram.locator('[data-part="3"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(diagram.locator('[data-map-part="3"]')).toHaveClass('part-active');
});
test('RFQ transfers only on request, preserves edits and uses existing enquiry submission', async ({
  page,
}) => {
  let submitted: any;
  await page.route('**/api/enquiries', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ json: { preview: true } });
  });
  await page.goto(path);
  const rfq = page.locator('[data-buyer-tool="rfq"]');
  await rfq.locator('[data-rfq-field="material"]').fill('Cement, density to confirm');
  await rfq.locator('[data-rfq-field="destination"]').fill('Kenya');
  expect(submitted).toBeUndefined();
  await rfq.locator('[data-use-brief]').click();
  const message = rfq.locator('textarea[name="message"]');
  expect(await message.inputValue()).toContain('Destination / delivery place: Kenya');
  await message.fill('My additional procurement requirements must survive edits.');
  await rfq.locator('[data-use-brief]').click();
  await expect(message).toHaveValue('My additional procurement requirements must survive edits.');
  await expect(rfq.locator('[data-rfq-status]')).toContainText('has edits');
  await message.fill('');
  await rfq.locator('[data-use-brief]').click();
  await rfq.locator('input[name="name"]').fill('Test procurement buyer');
  await rfq.locator('input[name="email"]').fill('buyer@example.test');
  await rfq.locator('button[type="submit"]').click();
  await expect(rfq.locator('[data-form-status]')).toContainText('saved to the local preview');
  expect(submitted.message).toContain('Kenya');
  expect(submitted.machineId).toBe('v-type-silobas');
});
test('Turkish mobile tools retain bounded tables, download worksheets and localise brief text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design/guides/tr/cimento-silobasi-teklif-bilgileri/');
  const comparison = page.locator('[data-buyer-tool="comparison"]');
  await comparison.locator('select[data-coverage="A"]').first().selectOption('confirmed');
  await expect(comparison.locator('[data-coverage-summary]')).toContainText('Seçenek A: 1/6');
  const download = page.waitForEvent('download');
  await comparison.locator('[data-download-comparison]').click();
  expect((await download).suggestedFilename()).toBe('technicsan-quotation-worksheet.txt');
  const rfq = page.locator('[data-buyer-tool="rfq"]');
  await rfq.locator('[data-rfq-field="destination"]').fill('Türkiye');
  await rfq.locator('[data-use-brief]').click();
  expect(await rfq.locator('textarea[name="message"]').inputValue()).toContain(
    'Hedef ülke / teslim yeri: Türkiye',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
