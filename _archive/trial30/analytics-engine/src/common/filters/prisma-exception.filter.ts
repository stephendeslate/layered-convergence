import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private static readonly ERROR_MAP: Record<
    string,
    { status: number; message: string }
  > = {
    P2002: {
      status: HttpStatus.CONFLICT,
      message: 'A record with that unique constraint already exists',
    },
    P2025: {
      status: HttpStatus.NOT_FOUND,
      message: 'Record not found',
    },
    P2003: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint violation',
    },
    P2014: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Required relation violation',
    },
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const mapping = PrismaExceptionFilter.ERROR_MAP[exception.code];

    if (mapping) {
      response.status(mapping.status).json({
        statusCode: mapping.status,
        message: mapping.message,
        error: exception.code,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: exception.code,
      });
    }
  }
}
