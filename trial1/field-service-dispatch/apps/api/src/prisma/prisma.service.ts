import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  /**
   * Set the RLS tenant context for the current transaction.
   * All queries within the callback are scoped to the given company.
   */
  async withTenantContext<T>(companyId: string, fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      // Set the RLS context for this transaction
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_company_id = '${companyId}'`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }

  /**
   * Set tenant context without a transaction wrapper (for middleware use).
   * Caller is responsible for transaction management.
   */
  async setTenantContext(companyId: string): Promise<void> {
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_company_id = '${companyId}'`,
    );
  }

  /**
   * Clean the database (test only).
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase can only be used in test environment');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    for (const model of models) {
      const m = (this as any)[model];
      if (m && typeof m.deleteMany === 'function') {
        await m.deleteMany();
      }
    }
  }
}
