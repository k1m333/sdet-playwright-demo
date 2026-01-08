import { expect, Locator, Page } from '@playwright/test';

export class CheckBoxPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tree: Locator;
  readonly expandAllButton: Locator;
  readonly firstCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /check box/i });
    this.tree = page.locator('#tree-node');
    this.expandAllButton = page.getByRole('button', { name: /expand all/i });
    this.firstCheckbox = page.locator('.rct-checkbox').first();
  }

  async goto() {
    await this.page.goto('/checkbox', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
    await expect(this.tree).toBeVisible();
  }

  async expandAll() {
    await this.expandAllButton.click();
  }

  async selectFirstCheckbox() {
    await this.firstCheckbox.click();
  }

  async expectFirstCheckboxChecked() {
    const checkIcon = this.firstCheckbox.locator('svg.rct-icon-check');
    await expect(checkIcon).toBeVisible();
  }
}
