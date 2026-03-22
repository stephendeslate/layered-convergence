// TRACED: EM-PERF-004 — Response time measurement with performance.now()
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';
import { formatLogEntry } from '@escrow-marketplace/shared';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = performance.now();
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = Math.round((performance.now() - startTime) * 100) / 100;
        response.setHeader('X-Response-Time', `${duration}ms`);
        process.stdout.write(
          formatLogEntry('info', 'response-time', { durationMs: duration }) + '\n',
        );
      }),
    );
  }
}
