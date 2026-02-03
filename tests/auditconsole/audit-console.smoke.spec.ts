import { test, expect } from '@playwright/test';

test.describe('Audit Console – smoke', () => {
  test('ingest event and find it via search', async ({ page }) => {
    const eventId = `evt-${Date.now()}`;

    await test.step('Open audit console', async () => {
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: /audit console/i })
      ).toBeVisible();
    });

    await test.step('Ingest an event', async () => {
      await page.locator('#eventId').fill(eventId);
      await page.locator('#tenantId').fill('t1');
      await page.locator('#actor').fill('aj');
      await page.locator('#action').fill('LOGIN');
      await page.locator('#resource').fill('console');

      await page.locator('#ingestBtn').click();

      // Smoke-level confirmation (don’t over-assert)
      await expect(page.locator('#status')).toContainText(eventId);
    });

    await test.step('Search for the ingested event', async () => {
      await page.locator('#query').fill(eventId);
      await page.locator('#searchBtn').click();

      const results = page.locator('#results');
      await expect(results).toBeVisible();
      await expect(results).toContainText(eventId);
      await expect(results).toContainText('LOGIN');
    });

  });
});

test.describe('Audit Console – idempotency', () => {
  test('duplicate eventId is accepted but not duplicated', async ({ page }) => {
    const eventId = `evt-${Date.now()}`;

    await test.step('Open audit console', async () => {
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: /audit console/i })
      ).toBeVisible();
    });

    await test.step('Ingest the same event twice', async () => {
      for (let i = 0; i < 2; i++) {
        await page.locator('#eventId').fill(eventId);
        await page.locator('#tenantId').fill('t1');
        await page.locator('#actor').fill('aj');
        await page.locator('#action').fill('LOGIN');
        await page.locator('#resource').fill('console');

        await page.locator('#ingestBtn').click();

        // Smoke-level: we just confirm the UI responded
        await expect(page.locator('#status')).toContainText(eventId);
      }
    });

    await test.step('Search shows only one result', async () => {
      await page.locator('#query').fill(eventId);
      await page.locator('#searchBtn').click();

      const results = page.locator('#results');
      await expect(results).toBeVisible();

      // ✅ Key assertion: eventId appears only once
      await expect(results).toContainText(eventId);
      await expect(results.locator('tr')).toHaveCount(1);
    });

  });

});

