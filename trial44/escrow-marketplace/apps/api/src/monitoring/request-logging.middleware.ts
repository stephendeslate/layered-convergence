// TRACED: EM-RLOG-001
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';
import { LoggerService } from './logger.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    this.metrics.incrementRequestCount();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.metrics.recordResponseTime(duration);

      if (res.statusCode >= 400) {
        this.metrics.incrementErrorCount();
      }

      this.logger.log('Request completed', {
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
