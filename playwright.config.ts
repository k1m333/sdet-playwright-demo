import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'demoqa-chromium',
      testDir: './tests/demoqa',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://demoqa.com' },
    },
    {
      name: 'youtube-chromium',
      testDir: './tests/youtube',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://www.youtube.com' },
    },
    {
      name: 'auditconsole-chromium',
      testDir: './tests/auditconsole',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4188' },
    },
  ],

  webServer: [
    {
      command: 'npm --prefix audit-console/server run dev',
      url: 'http://127.0.0.1:4177/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npx http-server audit-console/web -p 4188 -c-1',
      url: 'http://localhost:4188',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
