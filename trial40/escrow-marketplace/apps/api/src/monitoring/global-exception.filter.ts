// TRACED: EM-MON-010 — Global exception filter with sanitized error responses
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatLogEntry } from '@escrow-marketplace/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'] as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string'
        ? exResponse
        : (exResponse as Record<string, unknown>).message as string || message;
    }

    const errorLog = formatLogEntry('error', 'unhandled exception', {
      correlationId,
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      stack: exception instanceof Error ? exception.stack : undefined,
    });
    process.stderr.write(errorLog + '\n');

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      correlationId,
    });
  }
}
