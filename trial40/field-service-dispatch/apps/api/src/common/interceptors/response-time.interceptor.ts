// TRACED: FD-PERF-004 — Response time interceptor using performance.now()
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { MetricsService } from '../../monitoring/metrics.service';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const elapsed = performance.now() - start;
        const duration = elapsed.toFixed(2);
        res.setHeader('X-Response-Time', `${duration}ms`);
        this.metrics.recordRequest(elapsed);
      }),
    );
  }
}
