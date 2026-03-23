import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';

// TRACED:AE-MON-005
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const clientCorrelationId = req.headers['x-correlation-id'] as string | undefined;
    const correlationId = clientCorrelationId ?? createCorrelationId();

    this.requestContext.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
