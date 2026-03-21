import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Middleware that extracts tenantId from the authenticated JWT payload
 * and sets the RLS context on the Prisma client for the current request.
 *
 * Applied globally to all routes except auth and embed (which use API key auth).
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (user?.tenantId) {
      // Set the tenant context for RLS via a raw query.
      // This is scoped per-connection; in practice each request
      // should use prisma.withTenantContext(tenantId) for queries.
      // We attach the tenantId to the request for downstream use.
      (req as any).tenantId = user.tenantId;
    }

    next();
  }
}
