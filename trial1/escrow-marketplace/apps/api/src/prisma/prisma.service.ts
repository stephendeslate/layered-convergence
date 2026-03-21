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
   * Execute a callback within a transaction that sets RLS session variables.
   * SET LOCAL scopes variables to the current transaction only.
   */
  async withRls<T>(
    userId: string,
    userRole: string,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    // Validate inputs to prevent SQL injection in SET LOCAL statements.
    // SET LOCAL does not support parameterized queries ($1), so we sanitize instead.
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeRole = userRole.replace(/[^a-zA-Z0-9_]/g, '');

    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_user_id = '${safeUserId}'`,
      );
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_user_role = '${safeRole}'`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }
}
