// TRACED: FD-MON-007 — Global exception filter with sanitized error responses
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable, Inject, LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';
import { formatLogEntry } from '@field-service-dispatch/shared';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject('LOGGER') private readonly logger: { error: (obj: Record<string, unknown>, msg: string) => void }) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const correlationId = request.headers['x-correlation-id'] as string;

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    this.logger.error(
      {
        correlationId,
        method: request.method,
        url: request.url,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
    );

    const logEntry = formatLogEntry('error', 'unhandled exception', {
      correlationId,
      method: request.method,
      url: request.url,
      status,
    });
    process.stderr.write(logEntry + '\n');

    const sanitizedResponse = typeof message === 'string'
      ? { statusCode: status, message }
      : { statusCode: status, ...(typeof message === 'object' ? message : { message: 'Internal server error' }) };

    // Never expose stack traces in production
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        statusCode: status,
        message: 'Internal server error',
      });
      return;
    }

    response.status(status).json(sanitizedResponse);
  }
}
