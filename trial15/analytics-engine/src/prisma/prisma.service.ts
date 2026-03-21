import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Sets the RLS tenant context via parameterized set_config.
   * This ensures all subsequent queries within the transaction
   * are scoped to the given tenant.
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$queryRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }

  /**
   * Executes a callback within a tenant-scoped transaction.
   * Sets the RLS tenant context before running the callback.
   */
  async withTenantTransaction<T>(
    tenantId: string,
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
      );
      return fn(tx);
    });
  }
}
