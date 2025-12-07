import { expect } from '@playwright/test';
export async function expectVisible(locator) {
  await locator.waitFor({ state: 'visible' });
  await expect(locator).toBeVisible();
}
