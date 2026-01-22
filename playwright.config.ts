import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'https://demoqa.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
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
  ],
});
