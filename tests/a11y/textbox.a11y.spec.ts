import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@a11y TextBox has no serious/critical accessibility violations", async ({ page }) => {
  await page.goto("/text-box", { waitUntil: "domcontentloaded" });

  // Use a stable anchor you already rely on (heading or form container)
  await expect(page.getByRole("heading", { name: /text box/i })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("#userForm")
    .exclude(".advertisement")
    .disableRules([
        "color-contrast",
        "label"
    ])
    .analyze();


  const seriousOrWorse = results.violations.filter(v =>
    v.impact === "serious" || v.impact === "critical"
  );

  if (seriousOrWorse.length) {
    console.log(
      seriousOrWorse.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }))
    );
  }

  expect(seriousOrWorse, "serious/critical a11y violations").toEqual([]);
});
