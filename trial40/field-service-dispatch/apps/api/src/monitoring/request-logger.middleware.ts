// TRACED: FD-MON-006 — Request logging middleware with structured output
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@field-service-dispatch/shared';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry('info', 'request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      process.stderr.write(entry + '\n');
    });

    next();
  }
}
