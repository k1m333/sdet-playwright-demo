import { expect, Locator, Page } from '@playwright/test';

export class CheckBoxPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tree: Locator;
  readonly expandAllButton: Locator;
  readonly collapseAllBtn: Locator;
  readonly firstCheckbox: Locator;
  readonly selectedResultItems: Locator;
  readonly results: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /check box/i });
    this.tree = page.locator('#tree-node');
    this.expandAllButton = page.getByRole('button', { name: /expand all/i });
    this.collapseAllBtn = page.getByRole('button', { name: /collapse all/i });
    this.firstCheckbox = page.locator('.rct-checkbox').first();
    this.selectedResultItems = page.locator('#result span.text-success');
    this.results = page.locator('#result');
  }

  async goto() {
    await this.page.goto('/checkbox', { waitUntil: 'domcontentloaded' });
    await this.waitForReady();
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

  async getSelectedResults(): Promise<string[]> {
    const items = await this.selectedResultItems.allTextContents();
    return items.map(t => t.trim()).filter(Boolean);
  }

  getResultsPanel() {
    return this.page.locator('#result');
  }

  async waitForReady() {
    await expect(this.page).toHaveURL(/\/checkbox\b/i);
    await expect(this.heading).toBeVisible();
  }

  async collapseAll() {
    await this.collapseAllBtn.click();
  }

}
