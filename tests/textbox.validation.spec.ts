import { test, expect } from './fixtures/test-fixtures';

test.describe('DemoQA Text Box - Validation', () => {
  test('blocks submit with invalid email', async ({ textBoxPage }) => {
    await textBoxPage.fillForm({
      fullName: 'AJ Kim',
      email: 'not-an-email',
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    });

    await textBoxPage.submitAndAssertBlocked();

    const isValid = await textBoxPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.checkValidity()
    );
    expect(isValid).toBe(false);
  });

  test('allows submit when email is missing (email optional)', async ({ textBoxPage }) => {
    await textBoxPage.fillForm({
      fullName: 'AJ Kim',
      email: '',
      currentAddress: '123 Main St',
      permanentAddress: '456 Second St',
    });

    await textBoxPage.submitAndAssertNoErrors();

    const isValid = await textBoxPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.checkValidity()
    );
    expect(isValid).toBe(true);
  });
});

