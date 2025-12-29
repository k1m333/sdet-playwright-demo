import { test, expect } from './fixtures/test-fixtures';

test('Text Box blocks submit with invalid email', async ({ page }) => {
  await page.goto('https://demoqa.com/text-box');

  await page.getByPlaceholder('Full Name').fill('AJ Kim');
  await page.getByPlaceholder('name@example.com').fill('not-an-email');
  await page.locator('#currentAddress').fill('123 Main St');
  await page.locator('#permanentAddress').fill('456 Second St');

  await page.getByRole('button', { name: 'Submit' }).click();

  const email = page.getByPlaceholder('name@example.com');
  const isValid = await email.evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(isValid).toBe(false);

  await expect(page.locator('#output')).toBeHidden();
});


test('Text Box: missing email follows HTML5 required behavior', async ({ page }) => {
  await page.goto('https://demoqa.com/text-box');

  // Fill required-ish fields except email
  await page.locator('#userName').fill('AJ Kim');
  await page.locator('#currentAddress').fill('123 Main St');
  await page.locator('#permanentAddress').fill('456 Second St');


  const email = page.locator('#userEmail');
  const submit = page.getByRole('button', { name: /submit/i });
  const output = page.locator('#output');

  // Detect actual constraint from the DOM
  const isRequired = await email.evaluate((el: HTMLInputElement) => el.required);

  await submit.click();

  if (isRequired) {
    // HTML5 blocks submission when required field missing
    const isValid = await email.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
    await expect(output).toBeHidden();
  } else {
    // Submission succeeds even without email
    await expect(output).toBeVisible();
    // And email line should not be printed
    await expect(output).not.toContainText(/Email/i);
  }
});

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