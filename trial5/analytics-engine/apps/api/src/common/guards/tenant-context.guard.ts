import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const tenantId = request.headers['x-tenant-id'];

    if (apiKey) {
      const tenant = await this.prisma.tenant.findUniqueOrThrow({
        where: { apiKey },
      }).catch(() => {
        throw new UnauthorizedException('Invalid API key');
      });
      request.tenantId = tenant.id;
      await this.prisma.setTenantContext(tenant.id);
      return true;
    }

    if (tenantId) {
      await this.prisma.tenant.findUniqueOrThrow({
        where: { id: tenantId },
      }).catch(() => {
        throw new UnauthorizedException('Invalid tenant ID');
      });
      request.tenantId = tenantId;
      await this.prisma.setTenantContext(tenantId);
      return true;
    }

    // Allow requests without tenant context for admin/management endpoints
    return true;
  }
}
