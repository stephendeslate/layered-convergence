// TRACED:EM-PERF-03 ResponseTimeInterceptor as APP_INTERCEPTOR
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performance } from 'perf_hooks';
import { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - start).toFixed(2);
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
