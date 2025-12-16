import { Page, Locator } from '@playwright/test';
import { BASE_URL } from '../utils/env';

export class ButtonsPage {
  readonly page: Page;

  // Buttons
  readonly doubleButton: Locator;
  readonly rightButton: Locator;
  readonly dynamicButton: Locator;

  // Messages
  readonly doubleClickMessage: Locator;
  readonly rightClickMessage: Locator;
  readonly dynamicClickMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Buttons
    this.doubleButton = page.getByRole('button', { name: 'Double Click Me' });
    this.rightButton = page.getByRole('button', { name: 'Right Click Me' });
    this.dynamicButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Messages
    this.doubleClickMessage = page.locator('#doubleClickMessage');
    this.rightClickMessage = page.locator('#rightClickMessage');
    this.dynamicClickMessage = page.locator('#dynamicClickMessage');
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/buttons`);
  }

  async doubleClickButton() {
    await this.doubleButton.dblclick();
  }

  async rightClickButton() {
    await this.rightButton.click({ button: 'right' });
  }

  async dynamicClickButton() {
    await this.dynamicButton.click();
  }
}
