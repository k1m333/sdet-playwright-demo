import { test, expect } from '@playwright/test';

test.describe('DemoQA Text Box - Field Boundaries', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://demoqa.com/text-box');
  });

  test('accepts exact max length for Full Name', async ({ page }) => {
    const maxName = 'A'.repeat(50);

    await page.getByRole('textbox', { name: /full name/i }).fill(maxName);
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(maxName)).toBeVisible();
  });

  test('handles over max length for Full Name gracefully', async ({ page }) => {
    const overName = 'B'.repeat(51);

    await page.getByRole('textbox', { name: /full name/i }).fill(overName);
    await page.getByRole('button', { name: /submit/i }).click();

    // App allows it — assert graceful rendering instead of rejection
    await expect(page.getByText(overName)).toBeVisible();
  });

  test('handles whitespace-only input for Current Address', async ({ page }) => {
    await page.getByRole('textbox', { name: /current address/i }).fill(' ');
    await page.getByRole('button', { name: /submit/i }).click();

    // Output should not render pure whitespace
    await expect(page.locator('#output')).not.toContainText(/^\s+$/);
  });

});