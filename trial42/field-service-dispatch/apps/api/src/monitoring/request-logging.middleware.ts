// TRACED: FD-REQUEST-LOGGING
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
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
