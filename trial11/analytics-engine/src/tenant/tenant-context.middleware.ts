import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId || typeof tenantId !== 'string') {
      throw new UnauthorizedException('x-tenant-id header is required');
    }

    // Convention 5.17: use $executeRaw with Prisma.sql tagged template, no $executeRawUnsafe
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`,
    );

    // type assertion justified: Express Request doesn't include tenantId by default
    (req as Request & { tenantId: string }).tenantId = tenantId;
    next();
  }
}
