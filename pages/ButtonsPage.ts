import { expect, Page, Locator } from '@playwright/test';

export class ButtonsPage {
  readonly page: Page;

  // Buttons
  readonly doubleButton: Locator;
  readonly rightClickButton: Locator;
  readonly dynamicClickButton: Locator;

  // Messages
  readonly doubleClickMessage: Locator;
  readonly rightClickMessage: Locator;
  readonly dynamicClickMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Buttons
    this.doubleButton = page.getByRole('button', { name: 'Double Click Me' });
    this.rightClickButton = page.getByRole('button', { name: 'Right Click Me' });
    this.dynamicClickButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Messages
    this.doubleClickMessage = page.locator('p#doubleClickMessage');
    this.rightClickMessage = page.locator('p#rightClickMessage');
    this.dynamicClickMessage = page.locator('p#dynamicClickMessage');
  }

  async goto() {
    // IMPORTANT: DemoQA often hangs on "load" — use domcontentloaded
    await this.page.goto('/buttons', { waitUntil: 'domcontentloaded' });

    // "Ready" anchor so we don't proceed until the page is actually usable
    await expect(this.doubleButton).toBeVisible();
  }

  async doubleClick() {
    await this.doubleButton.dblclick();
  }

  async rightClick() {
    await this.rightClickButton.click({ button: 'right' });
  }

  async dynamicClick() {
    await this.dynamicClickButton.click();
  }
}
