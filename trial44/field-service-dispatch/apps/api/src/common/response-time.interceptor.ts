// TRACED: FD-RESPONSE-TIME-INTERCEPTOR
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';
import { MetricsService } from '../monitoring/metrics.service';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    this.metricsService.incrementRequestCount();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = performance.now() - start;
          const response = context.switchToHttp().getResponse<Response>();
          response.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
          this.metricsService.recordResponseTime(duration);
        },
        error: () => {
          this.metricsService.incrementErrorCount();
        },
      }),
    );
  }
}
