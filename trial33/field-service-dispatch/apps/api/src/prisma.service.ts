import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

// TRACED: FD-SEC-RLS-001 — Tenant isolation via RLS
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
   * Set the current tenant context for RLS policies.
   * Uses $executeRaw with Prisma.sql to prevent injection.
   * TRACED: FD-SEC-RLS-003 — Parameterized tenant context
   */
  async setTenantContext(tenantId: string) {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`,
    );
  }
}
