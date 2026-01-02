import type { TestInfo, Page } from '@playwright/test';

export async function attachScreenshotOnFailure(
    page: Page,
    testInfo: TestInfo
) {
   if (testInfo.status === testInfo.expectedStatus) return;
   const screenshot = await page.screenshot({ fullPage: true });
   await testInfo.attach('failure-screenshot', {
       body: screenshot,
       contentType: 'image/png',
   });
}