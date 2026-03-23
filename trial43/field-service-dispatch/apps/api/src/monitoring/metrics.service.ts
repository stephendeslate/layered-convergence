// TRACED: FD-METRICS-SERVICE
import { Injectable } from '@nestjs/common';

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

  recordResponseTime(duration: number): void {
    this.totalResponseTime += duration;
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? this.totalResponseTime / this.requestCount
          : 0,
      uptime: (Date.now() - this.startTime) / 1000,
    };
  }
}
