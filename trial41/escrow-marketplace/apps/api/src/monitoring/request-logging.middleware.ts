// TRACED:EM-MON-06 request logging middleware using RequestContextService
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@em/shared';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
    private readonly metrics: MetricsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = performance.now();

    res.on('finish', () => {
      const duration = Math.round((performance.now() - startTime) * 100) / 100;
      const context = this.requestContext.toLogContext();

      const logContext = {
        ...context,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      };
      // TRACED:EM-FORMAT-LOG-ENTRY — structured log entry for audit trail
      const formatted = formatLogEntry('info', 'request completed', logContext);
      this.logger.logWithCorrelation('info', formatted, logContext);

      this.metrics.recordRequest(duration);
      if (res.statusCode >= 400) {
        this.metrics.recordError();
      }
    });

    next();
  }
}
