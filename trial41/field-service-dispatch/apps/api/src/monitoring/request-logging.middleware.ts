import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@field-service-dispatch/shared';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

// TRACED: FD-REQUEST-LOGGING
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      // T41 variation: read from RequestContextService instead of headers
      const context = this.requestContext.toLogContext();
      const logContext = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ...context,
      };
      // TRACED: FD-FORMAT-LOG-ENTRY — structured log entry for audit trail
      const formatted = formatLogEntry('info', `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, logContext);
      this.logger.info(logContext, formatted);
    });

    next();
  }
}
