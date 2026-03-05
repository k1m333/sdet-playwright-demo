import { test, expect } from '@playwright/test';
import dataset from './evals/dataset.json';
import { exactMatch, jsonHasKeys, isRefusal } from './evals/oracles';
import { metricsCollector } from '../../utils/metrics-collector';
import { retrieveChunks } from '../../utils/retrieval';

test('LLM evaluation harness', async ({ request }) => {
  // Reset collector before test run
  metricsCollector.clear();
  
  let passed = 0;
  let total = dataset.length;
  const base = process.env.AUDIT_API_BASE_URL ?? "http://localhost:4177";
  const url = `${base}/llm/respond`;

  for (const item of dataset) {
    const start = Date.now();

    // --- RAG step: retrieve relevant context ---
    let augmentedPrompt = item.prompt;
    let context = '';

    const contextChunks = retrieveChunks(item.prompt);
    if (contextChunks.length > 0) {
      context = contextChunks.join('\n\n');
      augmentedPrompt = `Context:\n${context}\n\nQuestion: ${item.prompt}\n\nAnswer based only on the context.`;
    }
    const response = await request.post(url, {
      data: { prompt: augmentedPrompt }
    });
    
    const duration = Date.now() - start;
    const body = await response.json();
    const output = body.responseText;
console.log(`🔧 RAW RESPONSE: ${JSON.stringify(body)}`);
    // --- Faithfulness check ---
    if (contextChunks.length > 0) {
      const contextText = context.toLowerCase();
      const outputLower = output.toLowerCase();
      const keyTerms = contextText.split(' ').slice(0, 10).map(w => w.replace(/[^\w]/g, ''));
      const missingTerms = keyTerms.filter(term => term.length > 3 && !outputLower.includes(term));
      const faithful = missingTerms.length < 3;
      
      if (!faithful) {
        console.warn(`⚠️ Low faithfulness for prompt: ${item.prompt}`);
      }
    }

    // --- Original evaluation (exact match, schema, refusal) ---
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
// DEBUG LOGS — now result is defined
console.log(`\n🔍 Query: ${item.prompt}`);
console.log(`📝 Type: ${item.type}`);
console.log(`✅ Expected: ${item.ground_truth || item.schema || 'refusal'}`);
console.log(`🤖 Actual: ${output?.substring(0, 100)}`);
console.log(`📊 Result: ${result ? 'PASS' : 'FAIL'}`);
    if (result) passed++;
    

    // Record metrics for this API call
    metricsCollector.add({
      testId: 'llm-eval-harness',
      status: response.status(),
      durationMs: duration,
      expectedSeverity: item.type === "exact" ? item.ground_truth : 'N/A',
      actualSeverity: output?.substring(0, 50) || '', // truncate
      passed: result
    });
  }

  const passRate = passed / total;
  const summary = metricsCollector.calculateSummary();

  console.log('📊 Test Metrics Summary:', summary);
  console.log(`Eval Summary: ${passed}/${total} passed (${(passRate * 100).toFixed(1)}%)`);

  // Optional: write metrics to file
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