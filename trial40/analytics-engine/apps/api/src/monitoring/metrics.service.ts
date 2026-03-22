// TRACED:AE-MON-08 — In-memory metrics: request count, error count, avg response time, uptime
import { Injectable } from '@nestjs/common';

export interface MetricsSnapshot {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  uptime: number;
}

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(duration: number, isError: boolean): void {
    this.requestCount++;
    this.totalResponseTime += duration;
    if (isError) {
      this.errorCount++;
    }
  }

  getMetrics(): MetricsSnapshot {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? Math.round(this.totalResponseTime / this.requestCount)
          : 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
