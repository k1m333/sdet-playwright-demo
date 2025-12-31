import { test, expect } from '../fixtures/test-fixtures';
import { ButtonsPage } from '../pages/ButtonsPage';

test.describe('Buttons page @smoke', () => {
  test.beforeEach(async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.goto();
  });

  test('Double Click Button shows correct message', async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.doubleClick();
    await expect(buttonsPage.doubleClickMessage).toBeVisible();
    await expect(buttonsPage.doubleClickMessage).toHaveText('You have done a double click');
  });

  test('Right Click Button shows correct message', async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.rightClick();
    await expect(buttonsPage.rightClickMessage).toBeVisible();
    await expect(buttonsPage.rightClickMessage).toHaveText('You have done a right click');
  });

  test('Dynamic Click Button shows correct message', async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.dynamicClick();
    await expect(buttonsPage.dynamicClickMessage).toBeVisible();
    await expect(buttonsPage.dynamicClickMessage).toHaveText('You have done a dynamic click');
  });
});
