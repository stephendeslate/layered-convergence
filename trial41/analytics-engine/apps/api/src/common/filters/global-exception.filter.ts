// TRACED:AE-GLOBAL-EXCEPTION-FILTER
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLoggerService } from '../../monitoring/pino-logger.service';
import { RequestContextService } from '../../monitoring/request-context.service';

@Catch()
@Injectable()
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

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.logWithCorrelation('error', 'Unhandled exception', {
      ...this.requestContext.toLogContext(),
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      stack,
    });

    // Sanitized response — no stack traces in production
    response.status(status).json({
      statusCode: status,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
