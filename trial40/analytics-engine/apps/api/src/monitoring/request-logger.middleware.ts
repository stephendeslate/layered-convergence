// TRACED:AE-MON-05 — Request logging middleware logs method, URL, status, duration, correlationId
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PinoLoggerService } from './logger.provider';
import { CORRELATION_ID_HEADER } from './correlation.middleware';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = req.headers[CORRELATION_ID_HEADER] as string;

      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          correlationId,
        }),
      );
    });

    next();
  }
}
