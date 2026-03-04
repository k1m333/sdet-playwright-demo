import { test, expect } from '@playwright/test';
import dataset from './evals/dataset.json';
import { exactMatch, jsonHasKeys, isRefusal } from './evals/oracles';
import { metricsCollector } from '../../utils/metrics-collector';
import { recordMetric } from '../../fixtures/test'; // if using fixture approach

test('LLM evaluation harness', async ({ request }) => {
  // Reset collector before test run
  metricsCollector.clear();
  
  let passed = 0;
  let total = dataset.length;
  const base = process.env.AUDIT_API_BASE_URL ?? "http://localhost:4177";
  const url = `${base}/llm/respond`;
  
  for (const item of dataset) {
    const start = Date.now();
    
    const response = await request.post(url, {
      data: { prompt: item.prompt }
    });
    
    const duration = Date.now() - start;
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

    // Record metrics for this API call
    metricsCollector.add({
      testId: 'llm-eval-harness',
      status: response.status(),
      durationMs: duration,
      expectedSeverity: item.type === "exact" ? item.ground_truth : 'N/A',
      actualSeverity: output?.substring(0, 50) || '', // truncate for readability
      passed: result
    });
  }

  const passRate = passed / total;
  
  // Generate and display summary
  const summary = metricsCollector.calculateSummary();
  console.log('📊 Test Metrics Summary:', summary);
  console.log(`Eval Summary: ${passed}/${total} passed (${(passRate * 100).toFixed(1)}%)`);

  // Optional: Write to file
  const fs = require('fs');
  fs.writeFileSync(
    'test-results/metrics-report.json',
    JSON.stringify({ summary, details: metricsCollector.getAll() }, null, 2)
  );

  expect(passRate).toBeGreaterThanOrEqual(0.8);
});

test.afterAll(() => {
  const summary = metricsCollector.calculateSummary();
  console.log('📊 Final Test Metrics:', summary);
});
