import { expect, test } from '../fixtures/test-fixtures';
import { CheckBoxPage } from '../pages/CheckBoxPage';

test('expands tree and select a checkbox', async ({ page }) => {
    const checkBoxPage = new CheckBoxPage(page);
    await checkBoxPage.goto();
    await checkBoxPage.expandAll();
    await checkBoxPage.selectFirstCheckbox();
    await checkBoxPage.expectFirstCheckboxChecked();
});

test('Expand all → select first checkbox → result panel shows a value', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);

  await checkBoxPage.goto();
  await checkBoxPage.expandAll();
  await checkBoxPage.selectFirstCheckbox();

  const results = await checkBoxPage.getSelectedResults();
  expect(results.length).toBeGreaterThan(0);
});

test('Expand Home, check Downloads, and assert result reflects selection', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);
  await checkBoxPage.goto();
  await checkBoxPage.expandAll();
  await page.locator('label[for="tree-node-downloads"] .rct-checkbox').click();
  await expect(page.locator('#result')).toContainText('downloads');
});