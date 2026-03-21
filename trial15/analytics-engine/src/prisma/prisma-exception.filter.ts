import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

interface PrismaErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

const ERROR_MAP: Record<
  string,
  { status: number; error: string; messageBuilder: (e: Prisma.PrismaClientKnownRequestError) => string }
> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    error: 'Conflict',
    messageBuilder: (e) => {
      const target = (e.meta?.['target'] as string[])?.join(', ') ?? 'field';
      return `Unique constraint violation on: ${target}`;
    },
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    error: 'Not Found',
    messageBuilder: () => 'Record not found',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    messageBuilder: (e) => {
      const field = (e.meta?.['field_name'] as string) ?? 'field';
      return `Foreign key constraint failed on: ${field}`;
    },
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const mapping = ERROR_MAP[exception.code];

    if (mapping) {
      const body: PrismaErrorResponse = {
        statusCode: mapping.status,
        message: mapping.messageBuilder(exception),
        error: mapping.error,
      };
      response.status(mapping.status).json(body);
    } else {
      const body: PrismaErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected database error occurred',
        error: 'Internal Server Error',
      };
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
    }
  }
}
