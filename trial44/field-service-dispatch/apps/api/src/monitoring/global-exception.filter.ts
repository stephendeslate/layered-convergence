// TRACED: FD-GLOBAL-EXCEPTION-FILTER
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@field-service-dispatch/shared';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // TRACED: FD-EXCEPTION-BODY-SANITIZE
    const sanitizedBody = request.body
      ? sanitizeLogContext(request.body as Record<string, unknown>)
      : undefined;

    const correlationId = this.requestContext.correlationId;

    this.logger.error(
      `Unhandled exception: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        body: sanitizedBody,
      },
    );

    // TRACED: FD-ERROR-CORRELATION-ID
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      correlationId,
    });
  }
}
