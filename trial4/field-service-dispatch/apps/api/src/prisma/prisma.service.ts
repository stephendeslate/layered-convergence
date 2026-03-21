import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Set company context for RLS policies.
   * Must be called before any company-scoped query.
   */
  async setCompanyContext(companyId: string) {
    await this.$executeRawUnsafe(
      `SET app.current_company_id = '${companyId}'`,
    );
  }
}
