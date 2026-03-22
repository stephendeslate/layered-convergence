// TRACED: FD-API-003 — Prisma service with safe raw queries
// TRACED: FD-SEC-005 — SQL injection prevention via Prisma.sql tagged templates
// TRACED: FD-DB-001 — Prisma schema generator/datasource
// TRACED: FD-DB-002 — Tenant model with @@map
// TRACED: FD-DB-003 — User model with role enum
// TRACED: FD-DB-008 — All models use @@map
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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

  /** Set RLS tenant context for the current transaction */
  async setTenantContext(tenantId: string) {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    );
  }
}
