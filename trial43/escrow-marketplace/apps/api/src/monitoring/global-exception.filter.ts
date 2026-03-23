// TRACED: EM-GEXF-001
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestContextService } from './request-context.service';
import { LoggerService } from './logger.service';
import { sanitizeLogContext } from '@escrow-marketplace/shared';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
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

    // TRACED: EM-LSAN-003
    const sanitizedBody = request.body
      ? sanitizeLogContext(request.body as Record<string, unknown>)
      : {};

    this.logger.error('Unhandled exception', {
      correlationId: this.requestContext.correlationId,
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      error: message,
      stack:
        exception instanceof Error ? exception.stack : String(exception),
      body: sanitizedBody,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.requestContext.correlationId,
    });
  }
}
