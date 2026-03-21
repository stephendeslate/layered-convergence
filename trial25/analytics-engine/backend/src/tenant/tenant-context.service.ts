import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// [TRACED:SEC-004] TenantContextService sets RLS context using $executeRaw with Prisma.sql
@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sets the tenant context for RLS policies using $executeRaw with Prisma.sql
   * tagged template. This is production code that runs before every tenant-scoped query.
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`
    );
    this.logger.debug(`Tenant context set to ${tenantId}`);
  }

  /**
   * Clears the tenant context after request processing.
   */
  async clearTenantContext(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', '', true)`
    );
  }
}
