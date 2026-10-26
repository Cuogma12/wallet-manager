const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:4174',
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'node scripts/serve-pwa.cjs',
    env: { PORT: '4174' },
    url: 'http://localhost:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
