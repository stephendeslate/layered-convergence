import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Global exception filter for Prisma client errors.
 * Maps Prisma error codes to appropriate HTTP status codes:
 * - P2025 (record not found) -> 404
 * - P2002 (unique constraint violation) -> 409
 * - P2003 (foreign key constraint violation) -> 400
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string;

    switch (exception.code) {
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Unique constraint violation on: ${(exception.meta?.target as string[])?.join(', ') ?? 'unknown field'}`;
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Foreign key constraint violation on: ${(exception.meta?.field_name as string) ?? 'unknown field'}`;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        this.logger.error(`Unhandled Prisma error: ${exception.code}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
}
