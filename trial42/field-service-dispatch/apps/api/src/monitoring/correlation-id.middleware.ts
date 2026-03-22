// TRACED: FD-CORRELATION-MIDDLEWARE
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@field-service-dispatch/shared';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || createCorrelationId();
    res.setHeader('X-Correlation-ID', correlationId);
    this.requestContext.correlationId = correlationId;
    next();
  }
}
