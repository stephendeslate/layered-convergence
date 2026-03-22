import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

// TRACED:AE-MON-007
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
    @Inject(RequestContextService)
    private readonly requestContext: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // TRACED:AE-MON-013 — sanitize request body before logging
    const sanitizedBody = request.body
      ? sanitizeLogContext(request.body as Record<string, unknown>)
      : undefined;

    this.logger.error('Unhandled exception', {
      correlationId: this.requestContext.correlationId,
      statusCode: status,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Sanitized response — no stack traces
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.requestContext.correlationId,
    });
  }
}
