import { Page, Locator } from '@playwright/test';
import { BASE_URL } from '../utils/env';

export class ButtonsPage {
  readonly page: Page;

  // Buttons
  readonly doubleClickButton: Locator;
  readonly rightClickButton: Locator;
  readonly dynamicClickButton: Locator;

  // Messages
  readonly doubleClickMessage: Locator;
  readonly rightClickMessage: Locator;
  readonly dynamicClickMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Buttons
    this.doubleClickButton = page.getByRole('button', { name: 'Double Click Me' });
    this.rightClickButton = page.getByRole('button', { name: 'Right Click Me' });
    this.dynamicClickButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Messages
    this.doubleClickMessage = page.locator('#doubleClickMessage');
    this.rightClickMessage = page.locator('#rightClickMessage');
    this.dynamicClickMessage = page.locator('#dynamicClickMessage');
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/buttons`);
  }

  async doubleClick() {
    await this.doubleClickButton.dblclick();
  }

  async rightClick() {
    await this.rightClickButton.click({ button: 'right' });
  }

  async dynamicClick() {
    await this.dynamicClickButton.click();
  }
}
