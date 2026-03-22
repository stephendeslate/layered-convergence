// TRACED:AE-MON-04 — Correlation ID middleware preserves or generates X-Correlation-ID
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@analytics-engine/shared';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string) || createCorrelationId();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
