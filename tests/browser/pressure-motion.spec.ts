import { test, expect } from '@playwright/test';

test('hero waits for the intro, runs once, settles and can be replayed without moving controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/');
  const artwork = page.locator('[data-pressure-art]');
  const intro = page.locator('[data-site-loader]');
  const replay = page.getByRole('button', { name: 'Replay motion', exact: true });
  await expect(intro).toBeVisible();
  await expect(artwork).not.toHaveAttribute('data-motion', 'running');
  await page.getByRole('button', { name: 'Continue to website', exact: true }).click();
  await expect(artwork).toHaveAttribute('data-motion', 'running');
  const actions = page.locator('.pressure-hero-copy .pressure-actions');
  const before = await actions.boundingBox();
  const piston = page.locator('[data-pressure-piston="left"]');
  const initial = await piston.evaluate((element) => getComputedStyle(element).transform);
  await expect
    .poll(() => piston.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initial);
  await expect(replay).toBeDisabled();
  await expect(artwork).toHaveAttribute('data-motion', 'settled', { timeout: 6000 });
  expect(await actions.boundingBox()).toEqual(before);
  await expect(replay).toBeEnabled();
  await replay.click();
  await expect(artwork).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(artwork).toHaveAttribute('data-motion', 'reduced');
  await expect(replay).toBeHidden();
  await expect(artwork.locator('img')).toBeVisible();
});

test('reduced motion preserves the Turkish artwork and high contrast exposes the heading', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/tr/');
  const artwork = page.locator('[data-pressure-art]');
  await expect(artwork).toBeVisible();
  await expect(artwork).not.toHaveAttribute('data-motion', 'running');
  await expect(page.getByRole('button', { name: 'Animasyonu tekrar oynat' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'BASINÇ', exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await expect(artwork).toBeHidden();
  await expect(page.locator('.pressure-heading-text')).toBeVisible();
});
