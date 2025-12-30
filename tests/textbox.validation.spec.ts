import { test, expect } from './fixtures/test-fixtures';

test.describe('DemoQA Text Box', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('textbox', { name: /full name/i })).toBeVisible();
  });

  test('blocks submit with invalid email', async ({ textBoxPage }) => {
    await textBoxPage.navigate();

    await textBoxPage.fillForm({
      fullName: 'AJ Kim',
      email: 'not-an-email',
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    });

    // helper
    await textBoxPage.submitAndAssertBlocked();

    // optional: prove it’s HTML5 validation
    const isValid = await textBoxPage.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
  });


  test('allows submit when email is missing (email optional)', async ({ textBoxPage }) => {
    await textBoxPage.navigate();

    await textBoxPage.fillForm({
      fullName: 'AJ Kim',
      email: '', // key: explicitly missing
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    });

    // helper
    await textBoxPage.submitAndAssertNoErrors();

    // assertions you already like
    const isValid = await textBoxPage.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(true);
  });


  test.describe('Field Boundaries', () => {
    test('accepts exact max length for Full Name', async ({ page }) => {
      const maxName = 'A'.repeat(50);
      await page.getByRole('textbox', { name: /full name/i }).fill(maxName);
      await page.locator('#submit').click();
      await expect(page.getByText(maxName)).toBeVisible();
    });

    test('handles over max length for Full Name gracefully', async ({ page }) => {
      const overName = 'B'.repeat(51);
      await page.getByRole('textbox', { name: /full name/i }).fill(overName);
      await page.locator('#submit').click();
      await expect(page.getByText(overName)).toBeVisible();
    });

    test('handles whitespace-only input for Current Address', async ({ page }) => {
      await page.locator('#currentAddress').fill(' ');
      await page.locator('#submit').click();

      // Better assertion: output should exist but Current Address line shouldn't be just whitespace
      const output = page.locator('#output');
      await expect(output).toBeVisible();
      await expect(output).not.toHaveText(/Current Address:\s*$/); // if your expect supports it
    });
  });
});
