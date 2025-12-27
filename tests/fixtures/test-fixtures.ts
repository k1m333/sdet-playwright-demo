import { test as base, expect } from '@playwright/test';
import { TextBoxPage } from '../../pages/TextBoxPage';

type Fixtures = {
  textBoxPage: TextBoxPage;
};

export const test = base.extend<Fixtures>({
  textBoxPage: async ({ page }, use) => {
    const textBoxPage = new TextBoxPage(page);
    await use(textBoxPage);
  },
});

export { expect };
