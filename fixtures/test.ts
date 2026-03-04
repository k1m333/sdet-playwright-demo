import { test as base } from '@playwright/test';
import { metricsCollector, ApiCallMetric } from '../utils/metrics-collector';

// Extend the test object with a metrics fixture
export const test = base.extend<{
  recordMetric: (metric: Omit<ApiCallMetric, 'testId'>) => void;
}>({
  recordMetric: async ({}, use, testInfo) => {
    const record = (metric: Omit<ApiCallMetric, 'testId'>) => {
      metricsCollector.add({
        testId: testInfo.testId,
        ...metric
      });
    };
    await use(record);
  }
});

export { expect } from '@playwright/test';
