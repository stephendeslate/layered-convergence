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
   * Set RLS company context using parameterized query.
   * Convention 5.x: never use string interpolation for RLS context.
   */
  async setCompanyContext(companyId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.company_id', ${companyId}, true)`;
  }
}
