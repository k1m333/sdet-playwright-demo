import { test, expect } from '../fixtures/test-fixtures';
import { ButtonsPage } from '../pages/ButtonsPage';

test.describe('DemoQA Buttons Suite', () => {
  test.beforeEach(async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.goto();
  });

  test('Double Click Button shows correct message', async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.doubleClickButton();
    await expect(buttonsPage.doubleClickMessage).toBeVisible();
  });
});
