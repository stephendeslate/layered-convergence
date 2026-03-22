// TRACED:AE-PERF-06 — ResponseTimeInterceptor using performance.now(), sets X-Response-Time
// TRACED:AE-INFRA-01 — Dockerfile HEALTHCHECK targets /auth/health; interceptor measures response time
// TRACED:AE-INFRA-05 — CI pipeline runs lint+test+build+typecheck+migration-check+audit

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Request, Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = performance.now();
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = (performance.now() - startTime).toFixed(2);
        response.setHeader('X-Response-Time', `${elapsedMs}ms`);
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} ${elapsedMs}ms`,
        );
      }),
    );
  }
}
