// TRACED: EM-MON-007 — In-memory metrics collection
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(durationMs: number) {
    this.requestCount++;
    this.totalResponseTime += durationMs;
  }

  recordError() {
    this.errorCount++;
  }

  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime = this.requestCount > 0
      ? Math.round((this.totalResponseTime / this.requestCount) * 100) / 100
      : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTimeMs: avgResponseTime,
      uptimeSeconds,
    };
  }
}
