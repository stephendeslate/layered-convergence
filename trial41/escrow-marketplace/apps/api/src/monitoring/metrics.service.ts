// TRACED:EM-MON-04 in-memory metrics service
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(duration: number): void {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  recordError(): void {
    this.errorCount++;
  }

  getMetrics(): {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    uptime: number;
  } {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? Math.round((this.totalResponseTime / this.requestCount) * 100) / 100
          : 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
