// TRACED:AE-CORRELATION-ID-MIDDLEWARE
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    this.requestContext.setCorrelationId(correlationId);

    // Extract user/tenant info if present from JWT payload attached by auth guard
    const user = (req as Record<string, unknown>)['user'] as
      | { sub?: string; tenantId?: string }
      | undefined;
    if (user?.sub) {
      this.requestContext.setUserId(user.sub);
    }
    if (user?.tenantId) {
      this.requestContext.setTenantId(user.tenantId);
    }

    next();
  }
}
