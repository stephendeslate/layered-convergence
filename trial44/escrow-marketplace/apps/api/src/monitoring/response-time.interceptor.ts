// TRACED: EM-PERF-002
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    return next.handle().pipe(
      tap(() => {
        const ms = (performance.now() - start).toFixed(2);
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Response-Time', `${ms}ms`);
      }),
    );
  }
}
