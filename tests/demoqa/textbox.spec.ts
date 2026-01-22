import { test } from './fixtures/test-fixtures';

test('Text Box form submits and shows correct output @regression', async ({ textBoxPage }) => {
  const data = {
    fullName: 'AJ Kim',
    email: 'aj@test.com',
    currentAddress: '123 Main St',
    permanentAddress: '456 Second St',
  };

  await test.step('Fill form', async () => {
    await textBoxPage.fillForm(data);
  });

  await test.step('Submit and verify output', async () => {
    await textBoxPage.submitAndAssertNoErrors();
    await textBoxPage.expectOutput(data);
  });
});

