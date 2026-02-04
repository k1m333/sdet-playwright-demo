import { test } from '@playwright/test';

export async function logState(page) {
  await test.step('capture diagnostics', async () => {
    console.log('URL:', page.url());

    const html = await page.content();
    console.log('DOM size:', html.length);

    const rows = await page.locator('#results tr').count();
    console.log('Row count:', rows);
  });
}
