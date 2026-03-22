// TRACED:AE-MON-06 — Global exception filter logs stack+correlationId, returns sanitized error
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLoggerService } from './logger.provider';
import { CORRELATION_ID_HEADER } from './correlation.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = request.headers[CORRELATION_ID_HEADER] as string;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `Unhandled exception: ${message}`,
      stack,
      JSON.stringify({
        correlationId,
        method: request.method,
        url: request.originalUrl,
        statusCode: status,
      }),
    );

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (resp.message) {
          errorResponse.message = resp.message;
        }
      }
    }

    response.status(status).json(errorResponse);
  }
}
