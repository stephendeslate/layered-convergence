// TRACED:EM-MON-07 GlobalExceptionFilter as APP_FILTER using RequestContextService
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
    private readonly metrics: MetricsService,
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

    const context = this.requestContext.toLogContext();

    this.logger.logWithCorrelation('error', 'unhandled exception', {
      ...context,
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      error: message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    this.metrics.recordError();

    response.status(status).json({
      statusCode: status,
      message,
      correlationId: this.requestContext.getCorrelationId(),
      timestamp: new Date().toISOString(),
    });
  }
}
