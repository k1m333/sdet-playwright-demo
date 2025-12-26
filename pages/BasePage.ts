import { Page, Locator } from '@playwright/test';
import { BASE_URL } from '../utils/env';

export class BasePage {
    readonly page: Page;
    readonly locator: Locator;

    constructor(page: Page) {
        this.page = page;
    }
    
    goto() {}

    waitForPageLoad() {}

    isVisible(locator) {}
}