// TRACED: FD-PERF-004 — Response time interceptor using performance.now()
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const elapsed = performance.now() - start;
        const duration = elapsed.toFixed(2);
        res.setHeader('X-Response-Time', `${duration}ms`);
        const statusCode = res.statusCode;
        // Structured log: method, URL, status, duration
        process.stderr.write(
          `[ResponseTime] ${method} ${url} ${statusCode} ${duration}ms\n`,
        );
      }),
    );
  }
}
