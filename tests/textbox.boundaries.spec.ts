import { test, expect } from './fixtures/test-fixtures';

test.describe('DemoQA Text Box - Field Boundaries', () => {
  test('accepts exact max length for Full Name', async ({ textBoxPage }) => {
    const maxName = 'A'.repeat(50);

    const data = {
      fullName: maxName,
      email: 'aj@test.com',
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    };

    await textBoxPage.fillForm(data);
    await textBoxPage.submitAndAssertNoErrors();
    await textBoxPage.expectOutput(data);
  });

  test('handles over max length for Full Name gracefully', async ({ textBoxPage }) => {
    const overName = 'B'.repeat(51);

    await textBoxPage.fillForm({
      fullName: overName,
      email: 'aj@test.com',
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    });

    await textBoxPage.submitAndAssertNoErrors();
    await expect(textBoxPage.outputPanel).toBeVisible();
    await expect(textBoxPage.outputName).toContainText(overName);
  });

  test('handles whitespace-only input for Current Address', async ({ textBoxPage }) => {
    await textBoxPage.fillForm({
      fullName: 'AJ Kim',
      email: 'aj@test.com',
      currentAddress: ' ',
      permanentAddress: '456 Second St',
    });

    await textBoxPage.submitAndAssertNoErrors();

    await expect(textBoxPage.outputPanel).toBeVisible();
    await expect(textBoxPage.outputCurrentAddress).not.toHaveText(/^\s*$/);
  });
});

