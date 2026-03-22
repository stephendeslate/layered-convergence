// TRACED:AE-REQUEST-LOGGING-MIDDLEWARE
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { PinoLoggerService } from './pino-logger.service';
import { MetricsService } from './metrics.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly metrics: MetricsService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const statusCode = res.statusCode;

      this.metrics.recordRequest(durationMs);
      if (statusCode >= 400) {
        this.metrics.recordError();
      }

      const logContext = {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        durationMs,
        ...this.requestContext.toLogContext(),
      };
      // TRACED:AE-FORMAT-LOG-ENTRY — structured log entry for audit trail
      const formatted = formatLogEntry('info', 'Request completed', logContext);
      this.logger.logWithCorrelation('info', formatted, logContext);
    });

    next();
  }
}
