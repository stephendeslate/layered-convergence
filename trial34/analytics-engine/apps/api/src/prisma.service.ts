import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

// TRACED: AE-DA-PRISMA-001 — PrismaService with RLS context
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

  // TRACED: AE-DA-RLS-001 — $executeRaw with Prisma.sql for tenant context
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`,
    );
  }
}
