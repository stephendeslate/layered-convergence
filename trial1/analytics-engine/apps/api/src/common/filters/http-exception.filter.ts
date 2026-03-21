import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Global exception filter that ensures all error responses
 * follow the standard envelope format:
 * { error: { code, message, details, requestId } }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) ?? randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;

        // Handle NestJS validation pipe errors
        if (resp.message && Array.isArray(resp.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Validation failed';
          details = resp.message;
        } else if (resp.error) {
          // If it's already in our error format, pass it through
          if (resp.error.code) {
            response.status(status).json(resp);
            return;
          }
          code = this.httpStatusToCode(status);
          message = resp.message ?? resp.error;
        } else {
          message = resp.message ?? message;
        }
      }

      code = this.httpStatusToCode(status);
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log unexpected errors
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'RESOURCE_NOT_FOUND',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
