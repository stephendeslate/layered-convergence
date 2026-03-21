// [TRACED:SEC-007] Tenant context middleware sets RLS context per request

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: { tenantId: string; sub: string; role: string };
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (req.user?.tenantId) {
      await this.prisma.setTenantContext(req.user.tenantId);
    }
    next();
  }
}
