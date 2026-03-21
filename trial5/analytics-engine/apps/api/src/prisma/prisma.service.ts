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

  async setTenantContext(tenantId: string) {
    await this.$executeRaw`SET app.current_tenant_id = ${tenantId}`;
  }

  async clearTenantContext() {
    await this.$executeRaw`RESET app.current_tenant_id`;
  }
}
