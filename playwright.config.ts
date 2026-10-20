import { defineConfig } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4321';
export default defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined },
  },
  webServer: {
    command: `npm run dev -- --port ${new URL(baseURL).port || '4321'} --ignore-lock`,
    url: `${baseURL}/en/`,
    reuseExistingServer: true,
    timeout: 60000,
  },
  workers: 1,
  reporter: 'list',
});
