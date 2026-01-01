import { test } from './fixtures/test-fixtures';

test.describe('Textbox Smoke Tests @smoke', () => {
  test('happy path submits and shows output', async ({ textBoxPage }) => {
    await test.step('navigate to textbox page', async () => {
      await textBoxPage.navigate();
    });

    await test.step('fill valid form data', async () => {
      await textBoxPage.fillForm({
        fullName: 'Recruiter Test',
        email: 'recruiter@test.com',
        currentAddress: '123 Main St',
        permanentAddress: '456 Elm St',
      });
    });

    await test.step('submit and assert output renders', async () => {
      await textBoxPage.submitAndAssertNoErrors();
      await textBoxPage.expectOutputContains({
        fullName: 'Recruiter Test',
        email: 'recruiter@test.com',
      });
    });
  });
});

test('smoke | textbox invalid email blocks submission', async ({ textBoxPage }) => {
  await textBoxPage.navigate();
  await textBoxPage.fillName('No Email');
  await textBoxPage.fillEmail('invalid');
  await textBoxPage.submitAndAssertBlocked();
});
