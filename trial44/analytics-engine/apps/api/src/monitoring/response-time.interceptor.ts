import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

// TRACED:AE-PERF-004
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    this.metricsService.incrementRequestCount();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Math.round(performance.now() - start);
          const response = context.switchToHttp().getResponse<Response>();
          response.setHeader('X-Response-Time', `${duration}ms`);
          this.metricsService.addResponseTime(duration);
        },
        error: () => {
          this.metricsService.incrementErrorCount();
          const duration = Math.round(performance.now() - start);
          this.metricsService.addResponseTime(duration);
        },
      }),
    );
  }
}
