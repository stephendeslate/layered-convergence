import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    // Tenant ID is set by auth guards (JWT or API key)
    // and attached to req.tenantId
    const tenantId = (req as Request & { tenantId?: string }).tenantId;

    if (tenantId) {
      await this.tenantContext.setTenantContext(tenantId);
    }

    next();
  }
}
