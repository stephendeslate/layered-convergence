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

  async setCompanyContext(companyId: string) {
    await this.$executeRaw`SET LOCAL app.company_id = ${companyId}`;
  }

  async setUserContext(userId: string, role: string) {
    await this.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
    await this.$executeRaw`SET LOCAL app.current_user_role = ${role}`;
  }
}
