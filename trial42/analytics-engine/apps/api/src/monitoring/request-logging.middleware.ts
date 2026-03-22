import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';
import { PinoLoggerService } from './pino-logger.service';

// TRACED:AE-MON-006
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: PinoLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      this.logger.info('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.correlationId,
      });
    });

    next();
  }
}
