import { test } from './fixtures/test-fixtures';
 
test('Text Box form submits and shows correct output', async ({ textBoxPage }) => {
  const data = {
    fullName: 'AJ Kim',
    email: 'aj@test.com',
    currentAddress: '123 Main St',
    permanentAddress: '456 Second St',
  };

  await textBoxPage.navigate();
  await textBoxPage.fillForm(data);
  await textBoxPage.submit();
  await textBoxPage.expectOutput(data);
});
