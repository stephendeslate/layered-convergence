// TRACED: EM-METR-001
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  recordResponseTime(ms: number) {
    this.totalResponseTime += ms;
  }

  getMetrics() {
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
