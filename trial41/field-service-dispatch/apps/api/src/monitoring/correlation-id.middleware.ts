import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@field-service-dispatch/shared';
import { RequestContextService } from './request-context.service';

// TRACED: FD-CORRELATION-ID
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // T41 variation: store in request-scoped context service
    this.requestContext.setCorrelationId(correlationId);

    next();
  }
}
