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
    await this.page.goto('https://demoqa.com/text-box');
    await expect(this.page).toHaveURL(/text-box/);
  }

  async fillForm(data: TextBoxFormData) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.currentAddressInput.fill(data.currentAddress);
    await this.permanentAddressInput.fill(data.permanentAddress);
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

