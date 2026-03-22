// TRACED: FD-MON-008 — In-memory metrics service for request tracking
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(responseTimeMs: number) {
    this.requestCount++;
    this.totalResponseTime += responseTimeMs;
  }

  recordError() {
    this.errorCount++;
  }

  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime = this.requestCount > 0
      ? parseFloat((this.totalResponseTime / this.requestCount).toFixed(2))
      : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: avgResponseTime,
      uptime,
    };
  }
}
