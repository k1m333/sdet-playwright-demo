import { test as base, expect } from '@playwright/test';
import { TextBoxPage } from '../../pages/TextBoxPage';
import { attachScreenshotOnFailure } from '../../utils/testDiagnostics';

type Fixtures = { textBoxPage: TextBoxPage };

export const test = base.extend<Fixtures>({
  textBoxPage: async ({ page }, use) => {
    const textBoxPage = new TextBoxPage(page);

    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('textbox', { name: /full name/i })).toBeVisible();

    await use(textBoxPage);
  },
});

export { expect };

test.afterEach(async ({ page }, testInfo) => {
   await attachScreenshotOnFailure(page, testInfo);
});