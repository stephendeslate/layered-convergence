import { Injectable } from '@nestjs/common';

// TRACED:AE-MON-008
@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  addResponseTime(ms: number): void {
    this.totalResponseTime += ms;
  }

  getMetrics(): Record<string, unknown> {
    const avgResponseTime =
      this.requestCount > 0
        ? Math.round(this.totalResponseTime / this.requestCount)
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: avgResponseTime,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}
