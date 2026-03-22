// TRACED: EM-PERF-003 — Response time interceptor logging method, URL, status, duration and sets X-Response-Time header
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = performance.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
        response.setHeader('X-Response-Time', `${durationMs}ms`);
        this.logger.log(`${method} ${url} ${statusCode} ${durationMs}ms`);
      }),
    );
  }
}
