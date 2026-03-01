import { test, expect } from '@playwright/test';
import dataset from './evals/dataset.json';
import { exactMatch, jsonHasKeys, isRefusal } from './evals/oracles';

test('LLM evaluation harness', async ({ request }) => {

  let passed = 0;
  let total = dataset.length;
  const base = process.env.AUDIT_API_BASE_URL ?? "http://localhost:4177";
  const url = `${base}/llm/respond`;
  for (const item of dataset) {
    const response = await request.post(url, {
      data: { prompt: item.prompt }
    });
     const body = await response.json();
    const output = body.responseText;
    let result = false;
    if (item.type === "exact") {
      result = exactMatch(item.ground_truth, output);
    }

    if (item.type === "json_schema") {
      result = jsonHasKeys(output, item.schema);
    }

    if (item.type === "refusal") {
      result = isRefusal(output);
    }

    if (result) passed++;

  }

  const passRate = passed / total;

  console.log(`Eval Summary: ${passed}/${total} passed (${passRate})`);

  expect(passRate).toBeGreaterThanOrEqual(0.8);

});