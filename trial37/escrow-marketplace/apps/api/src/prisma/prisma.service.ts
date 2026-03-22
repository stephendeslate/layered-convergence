// TRACED: EM-DB-001 — All money fields Decimal(12,2) in Prisma schema
// TRACED: EM-DB-002 — RLS enabled and forced on all tables via migration
// TRACED: EM-DB-003 — All models use @@map for snake_case table names
// TRACED: EM-DB-004 — All enums use @@map with individual @map on values
// TRACED: EM-DB-005 — UUID primary keys on all models
// TRACED: EM-DB-006 — Tenant FK on all domain models
// TRACED: EM-DB-007 — Email unique per tenant constraint
// TRACED: EM-DB-008 — EscrowAccount unique transactionId
// TRACED: EM-ARCH-002 — Multi-tenant RLS enforcement via Prisma
// TRACED: EM-ARCH-004 — Decimal(12,2) for all money fields
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
