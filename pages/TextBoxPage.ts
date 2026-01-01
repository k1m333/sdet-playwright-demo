import { expect, Locator, Page } from '@playwright/test';

export type TextBoxFormData = {
  fullName: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
};

export class TextBoxPage {
  readonly page: Page;

  // Inputs
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly currentAddressInput: Locator;
  readonly permanentAddressInput: Locator;
  readonly submitButton: Locator;

  // Output (scoped to #output)
  readonly outputPanel: Locator;
  readonly outputName: Locator;
  readonly outputEmail: Locator;
  readonly outputCurrentAddress: Locator;
  readonly outputPermanentAddress: Locator;

  constructor(page: Page) {
    this.page = page;

    this.fullNameInput = page.getByPlaceholder('Full Name');
    this.emailInput = page.getByPlaceholder('name@example.com');
    this.currentAddressInput = page.locator('#currentAddress');
    this.permanentAddressInput = page.locator('#permanentAddress');
    this.submitButton = page.getByRole('button', { name: 'Submit' });

    this.outputPanel = page.locator('#output');
    this.outputName = this.outputPanel.locator('#name');
    this.outputEmail = this.outputPanel.locator('#email');
    this.outputCurrentAddress = this.outputPanel.locator('#currentAddress');
    this.outputPermanentAddress = this.outputPanel.locator('#permanentAddress');
  }

  async navigate() {
    await this.page.goto('/text-box', { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByRole('textbox', { name: /full name/i })).toBeVisible();
  }

  async fillForm(data: TextBoxFormData) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.currentAddressInput.fill(data.currentAddress);
    await this.permanentAddressInput.fill(data.permanentAddress);
  }

  async fillName(name: string) {
    await this.fullNameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async submit() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
  }

  async expectOutput(data: TextBoxFormData) {
    await expect(this.outputPanel).toBeVisible();

    await expect(this.outputName).toContainText(data.fullName);
    await expect(this.outputEmail).toContainText(data.email);
    await expect(this.outputCurrentAddress).toContainText(data.currentAddress);
    await expect(this.outputPermanentAddress).toContainText(data.permanentAddress);
  }

  async expectOutputContains(expected: {
    fullName?: string;
    email?: string;
  }) {
    await expect(this.outputPanel).toBeVisible();

    if (expected.fullName) {
      await expect(this.outputName).toContainText(expected.fullName);
    }

    if (expected.email) {
      await expect(this.outputEmail).toContainText(expected.email);
    }
  }

  async submitAndAssertNoErrors() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    await expect(this.outputPanel).toBeVisible();
  }

  async submitAndAssertBlocked() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    await expect(this.outputPanel).toBeHidden();
  }

}

