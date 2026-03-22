// TRACED:AE-METRICS-SERVICE
import { Injectable } from '@nestjs/common';
import { MetricsResponse } from '@analytics-engine/shared';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTimeMs = 0;
  private readonly startTime = Date.now();

  recordRequest(durationMs: number): void {
    this.requestCount++;
    this.totalResponseTimeMs += durationMs;
  }

  recordError(): void {
    this.errorCount++;
  }

  getMetrics(): MetricsResponse {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgResponseTimeMs:
        this.requestCount > 0
          ? Math.round((this.totalResponseTimeMs / this.requestCount) * 100) / 100
          : 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}
