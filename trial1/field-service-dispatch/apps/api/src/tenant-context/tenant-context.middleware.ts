import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Extracts companyId from JWT-authenticated user and sets the RLS context.
 * Applied globally except for auth and public customer portal routes.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (user?.companyId) {
      try {
        await this.prisma.setTenantContext(user.companyId);
      } catch (err) {
        this.logger.error(
          `Failed to set tenant context for company ${user.companyId}`,
          err,
        );
      }
    }

    next();
  }
}
