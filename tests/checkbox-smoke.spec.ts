import { test, expect } from '../fixtures/test-fixtures';
import { CheckBoxPage } from '../pages/CheckBoxPage';

test.describe('Check Box page @smoke', () => {
  test('loads and renders the checkbox tree', async ({ page }) => {
    const checkBoxPage = new CheckBoxPage(page);

    await checkBoxPage.goto();

    await expect(checkBoxPage.tree).toBeVisible();
    await expect(checkBoxPage.firstCheckbox).toBeVisible();
  });
});
