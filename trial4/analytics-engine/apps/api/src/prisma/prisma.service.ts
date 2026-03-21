import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Set tenant context for RLS policies.
   * Must be called before any tenant-scoped query.
   */
  async setTenantContext(tenantId: string) {
    await this.$executeRawUnsafe(
      `SET app.current_tenant_id = '${tenantId}'`,
    );
  }
}
