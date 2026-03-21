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

  async setCompanyContext(companyId: string) {
    await this.$executeRaw`SET app.current_company_id = ${companyId}`;
  }

  async clearCompanyContext() {
    await this.$executeRaw`RESET app.current_company_id`;
  }
}
