import { test } from '../fixtures/test-fixtures';
import { CheckBoxPage } from '../pages/CheckBoxPage';

test('expands tree and select a checkbox', async ({ page }) => {
    const checkBoxPage = new CheckBoxPage(page);
    await checkBoxPage.goto();
    await checkBoxPage.expandAll();
    await checkBoxPage.selectFirstCheckbox();
    await checkBoxPage.expectFirstCheckboxChecked();
});