export interface ApiCallMetric {
  testId: string;
  status: number;
  durationMs: number;
  expectedSeverity: string;
  actualSeverity: string;
  passed: boolean;
}

class MetricsCollector {
  private metrics: ApiCallMetric[] = [];

  add(metric: ApiCallMetric) {
    this.metrics.push(metric);
  }

  getAll() {
    return this.metrics;
  }

  calculateSummary() {
    const total = this.metrics.length;
    const count200 = this.metrics.filter(m => m.status === 200).length;
    const count409 = this.metrics.filter(m => m.status === 409).length;
    const count5xx = this.metrics.filter(m => m.status >= 500).length;

    // p95 response time
    const sortedDurations = this.metrics.map(m => m.durationMs).sort((a,b) => a - b);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p95 = sortedDurations[p95Index] || 0;

    const passRate = this.metrics.filter(m => m.passed).length / total;

    return {
      totalCalls: total,
      count200,
      count409,
      count5xx,
      p95,
      passRate
    };
  }

  clear() {
    this.metrics = [];
  }
}

// Export a singleton instance
export const metricsCollector = new MetricsCollector();
