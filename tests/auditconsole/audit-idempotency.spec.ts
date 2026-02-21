import { test, expect } from '@playwright/test';
import { logState } from '../support/diagnostics';


test('duplicate eventId is accepted but not duplicated', async ({ page }) => {
  try {
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
  } catch (e) {
    await logState(page);
    throw e;
  }
});

test('same eventId with DIFFERENT payload returns 409 and does not change results', async ({ page }) => {
  try {
      const eventId = `evt-${Date.now()}`;

      await test.step('Open audit console', async () => {
          await page.goto('/');
          await expect(page.getByRole('heading', { name: /audit console/i })).toBeVisible();
      });

      await test.step('Ingest initial event (valid)', async () => {
          await page.locator('#eventId').fill(eventId);
          await page.locator('#tenantId').fill('t1');
          await page.locator('#actor').fill('aj');
          await page.locator('#action').fill('LOGIN');
          await page.locator('#resource').fill('console');

          await page.locator('#ingestBtn').click();

          // Use the same "UI responded" contract as your other test
          await expect(page.locator('#status')).toContainText(eventId);
      });

      await test.step('Search shows exactly one result', async () => {
          await page.locator('#query').fill(eventId);
          await page.locator('#searchBtn').click();

          const results = page.locator('#results');
          await expect(results).toBeVisible();
          await expect(results).toContainText(eventId);
          await expect(results.locator('tr')).toHaveCount(1);
      });

      await test.step('Re-ingest same eventId with DIFFERENT payload (abuse) → expect 409', async () => {
          await page.locator('#eventId').fill(eventId);
          await page.locator('#tenantId').fill('t1');
          await page.locator('#actor').fill('DIFFERENT_ACTOR'); // abuse
          await page.locator('#action').fill('LOGIN');
          await page.locator('#resource').fill('console');

          await page.locator('#ingestBtn').click();

          // Most likely your UI puts errors in #status, not .error
          await expect(page.locator('#status')).toContainText(/409|conflict/i);
      });

      await test.step('Search still shows one result (immutability)', async () => {
          await page.locator('#query').fill(eventId);
          await page.locator('#searchBtn').click();

          const results = page.locator('#results');
          await expect(results).toBeVisible();
          await expect(results.locator('tr')).toHaveCount(1);
      });
  } catch (e) {
      await logState(page);
      throw e;
  }
});

test("POST /api/events returns 429 after exceeding rate limit", async ({ request }) => {
  const tenantId = "rl-tenant";
  const base = process.env.AUDIT_API_BASE_URL ?? "http://localhost:4177";
  const url = `${base}/api/events`;

  let lastResponse;

  for (let i = 0; i < 6; i++) {
    lastResponse = await request.post(url, {
      data: {
        eventId: `rl-event-${Date.now()}-${i}`,
        tenantId,
        actor: "tester",
        action: "create",
        resource: "rate-limit-test",
        ts: new Date().toISOString(),
      },
    });
  }

  expect(lastResponse!.status()).toBe(429);

  const body = await lastResponse!.json();
  expect(body.error).toBe("rate_limited");
  expect(typeof body.retryAfterMs).toBe("number");

  const retryAfter = lastResponse!.headers()["retry-after"];
  expect(retryAfter).toBeTruthy();
});