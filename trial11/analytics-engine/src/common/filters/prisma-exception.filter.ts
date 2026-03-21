import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    switch (exception.code) {
      case 'P2002':
        response
          .status(409)
          .json({ statusCode: 409, message: 'Conflict: duplicate entry' });
        break;
      case 'P2025':
        response
          .status(404)
          .json({ statusCode: 404, message: 'Not found' });
        break;
      case 'P2003':
        response
          .status(400)
          .json({ statusCode: 400, message: 'Invalid reference' });
        break;
      default:
        response
          .status(500)
          .json({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
