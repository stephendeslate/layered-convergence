import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Set RLS company context for the current transaction.
   * Uses parameterized set_config to prevent SQL injection (convention 5.17).
   */
  async setCompanyContext(companyId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.company_id', ${companyId}, true)`;
  }
}
