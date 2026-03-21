import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Sets the tenant context for Row-Level Security.
   * Uses Prisma.sql tagged template (NOT $executeRawUnsafe) to prevent SQL injection.
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}
