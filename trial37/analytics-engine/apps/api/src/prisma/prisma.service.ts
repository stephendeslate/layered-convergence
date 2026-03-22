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

  /** Execute a raw query safely using Prisma.sql tagged template */
  async executeRawSafe(query: ReturnType<typeof Prisma.sql>) {
    return this.$executeRaw(query);
  }

  /** Set tenant context for RLS using Prisma.sql */
  async setTenantContext(tenantId: string) {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}
