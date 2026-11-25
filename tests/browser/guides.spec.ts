import { test, expect } from '@playwright/test';
test('guides hub filters include the featured guide and preserve keyboard controls', async ({
  page,
}) => {
  await page.goto('/design/guides/');
  await expect(page.locator('[data-guide-card]')).toHaveCount(5);
  await expect(page.locator('[data-guide-search]')).toHaveCount(0);
  await page.locator('[data-guide-filter="lpg-catalog"]').click();
  await expect(page.locator('[data-guide-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-guide-count]')).toHaveText('1 guide');
  await page.getByRole('button', { name: 'All guides', exact: true }).click();
  await expect(page.locator('[data-guide-card]:visible')).toHaveCount(5);
});
test('rich bilingual guides provide mobile tables, checklists, related products and enquiry context', async ({
  page,
}) => {
  for (const [locale, slug] of [
    ['en', 'preparing-lpg-equipment-enquiry'],
    ['tr', 'lpg-ekipman-talebi-hazirlama'],
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/design/guides/${locale}/${slug}/`);
    await expect(page.locator('.guide-table table tbody tr')).toHaveCount(7);
    await expect(page.locator('.guide-checklist li')).toHaveCount(4);
    await expect(page.locator('.article-related [data-machine-card]')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const link = page.locator('.guide-enquiry a');
    await expect(link).toHaveAttribute(
      'href',
      /guide=guide-lpg-catalog-enquiry&family=lpg-catalog/,
    );
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.guide-enquiry')).toBeHidden();
    await page.emulateMedia({ media: 'screen' });
  }
});

test('guide reader keeps editorial typography, responsive contents and working section navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/design/guides/en/cement-bulker-quotation-checklist/');
  const outline = page.locator('.guide-outline');
  await expect(outline).toHaveAttribute('open', '');
  expect(
    await page
      .locator('.guide-section h2')
      .first()
      .evaluate((node) => getComputedStyle(node).fontFamily),
  ).toContain('Source Sans 3');
  const target = page.locator('.guide-outline nav a').nth(2);
  await target.click();
  await expect(page).toHaveURL(/#article-section-2$/);
  await expect(target).toHaveAttribute('aria-current', 'location');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(outline).not.toHaveAttribute('open');
  await outline.locator('summary').click();
  await expect(outline.locator('nav')).toBeVisible();
});
