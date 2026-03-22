// TRACED:EM-MON-05 correlation ID middleware with RequestContextService
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@em/shared';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    this.requestContext.setCorrelationId(correlationId);
    next();
  }
}
