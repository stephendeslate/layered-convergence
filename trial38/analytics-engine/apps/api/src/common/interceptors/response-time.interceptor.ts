// TRACED: AE-PERF-02
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor that logs response times for all API requests.
 * Records method, URL, status code, and duration in ms.
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ResponseTime');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = performance.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Math.round((performance.now() - startTime) * 100) / 100;
        response.setHeader('X-Response-Time', `${duration}ms`);
        this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
      }),
    );
  }
}
