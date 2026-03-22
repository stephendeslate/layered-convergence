// TRACED: FD-PERF-003 — Response time interceptor logging method, URL, status, duration
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ResponseTime');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = (performance.now() - start).toFixed(2);
        response.setHeader('X-Response-Time', `${duration}ms`);
        this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
      }),
    );
  }
}
