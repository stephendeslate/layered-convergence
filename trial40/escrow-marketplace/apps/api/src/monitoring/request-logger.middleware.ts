// TRACED: EM-MON-009 — Request logging middleware with structured output
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@escrow-marketplace/shared';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const correlationId = req.headers['x-correlation-id'] as string;
      const logLine = formatLogEntry('info', 'request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        correlationId,
      });
      process.stdout.write(logLine + '\n');
    });

    next();
  }
}
