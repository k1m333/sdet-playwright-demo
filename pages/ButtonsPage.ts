import { Page, Locator } from '@playwright/test';
import { BASE_URL } from '../utils/env';

export class ButtonsPage {
  constructor(page) {
    this.page = page;
    this.doubleButton = page.getByRole('button', { name: 'Double Click Me' });
    this.doubleClickMessage = page.locator('#doubleClickMessage');
  }

  async goto() { await this.page.goto(`${BASE_URL}/buttons`); }
  async doubleClickButton() { await this.doubleButton.dblclick(); }
}
