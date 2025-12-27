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


test('Text Box allows submit when email is missing (email optional)', async ({ page }) => {
  await page.goto('https://demoqa.com/text-box');

  await page.getByPlaceholder('Full Name').fill('AJ Kim');
  await page.locator('#currentAddress').fill('123 Main St');
  await page.locator('#permanentAddress').fill('456 Second St');

  const submit = page.locator('#submit');
  await submit.scrollIntoViewIfNeeded();
  await submit.click({ force: true });

  const output = page.locator('#output');
  await expect(output).toBeVisible();

  // Name should be printed
  await expect(output).toContainText('Name:AJ Kim');

  // Email line should NOT be printed when missing
  await expect(output).not.toContainText('Email:');
});

