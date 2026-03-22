import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

// TRACED: FD-GLOBAL-EXCEPTION-FILTER
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
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

    // T41 variation: read from RequestContextService instead of headers
    const context = this.requestContext.toLogContext();

    this.logger.errorWithData(
      {
        ...context,
        statusCode: status,
        path: request.url,
        method: request.method,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `Unhandled exception: ${message}`,
    );

    // Return sanitized error — no stack traces in production
    response.status(status).json({
      statusCode: status,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : message,
      timestamp: new Date().toISOString(),
      correlationId: context.correlationId,
    });
  }
}
