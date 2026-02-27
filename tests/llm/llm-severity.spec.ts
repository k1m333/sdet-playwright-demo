import { test, expect } from "@playwright/test";

test("LLM severity classifier returns max severity and cites evidence", async ({ request }) => {
  const cases: Array<{
    name: string;
    events: Array<{ status: number; tenantId?: string; eventId?: string }>;
    expectLabel: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    mustMention: string;
  }> = [
    {
      name: "200 + 409 => LOW (409 is anomaly)",
      events: [{ status: 200 }, { status: 409 }],
      expectLabel: "LOW",
      mustMention: "409"
    },
    {
      name: "429 => MEDIUM",
      events: [{ status: 429 }],
      expectLabel: "MEDIUM",
      mustMention: "429"
    },
    {
      name: "503 => HIGH",
      events: [{ status: 503 }],
      expectLabel: "HIGH",
      mustMention: "503"
    },
    {
      name: "429 + 503 => HIGH (max rule)",
      events: [{ status: 429 }, { status: 503 }],
      expectLabel: "HIGH",
      mustMention: "503"
    }
  ];

  for (const tc of cases) {
    const base = process.env.AUDIT_API_BASE_URL ?? "http://localhost:4177";
    const url = `${base}/llm/classify-severity`;
    const res = await request.post(url, {
      data: { events: tc.events }
    });

    expect(res.status(), tc.name).toBe(200);

    const body = await res.json();
    expect(body.label, tc.name).toBe(tc.expectLabel);

    // Evidence-based rationale: must cite winning status
    expect(String(body.rationale ?? ""), tc.name).toContain(tc.mustMention);
  }
});

