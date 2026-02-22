import { test, expect } from '@playwright/test';

test('Returns 503 when system is overloaded', async ({ request }) => {
    const event = {
        tenantId: "tenant-1",
        eventId: `evt-${Date.now()}`,
        payload: { action: "login"}
    };
    const response = await request.post('/events', {
        data: event
    });
    expect(response.status()).toBe(200);
    const retryAfter = response.headers()['retry-after'];
    expect(retryAfter).toBeTruthy();
});