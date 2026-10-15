import { defineConfig } from '@playwright/test';

/**
 * Аудит вёрстки (npm run audit:layout): собранный сайт в vite preview, установленный Chrome
 * (channel: 'chrome' — отдельные браузеры Playwright скачивать не нужно).
 */
export default defineConfig({
  testDir: './audit',
  testMatch: '*.audit.ts',
  outputDir: './test-results/playwright',
  fullyParallel: true,
  timeout: 90_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'chrome',
    headless: true,
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
