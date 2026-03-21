import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma client extended with RLS tenant context.
   * Every query executed through the returned client will first
   * SET LOCAL app.current_tenant_id to the provided tenantId,
   * ensuring PostgreSQL RLS policies scope all results.
   */
  withTenantContext(tenantId: string) {
    return this.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          // Use $executeRawUnsafe to set the tenant context before each query.
          // SET LOCAL scopes this to the current transaction.
          await this.$executeRawUnsafe(
            `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
          );
          return query(args);
        },
      },
    });
  }

  /**
   * Wraps operations in a transaction with RLS tenant context set.
   * This is the preferred method for mutations that need tenant isolation.
   */
  async withTenantTransaction<T>(
    tenantId: string,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }
}
