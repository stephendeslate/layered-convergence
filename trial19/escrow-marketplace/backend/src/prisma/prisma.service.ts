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

  async setTenantContext(userId: string, role: string): Promise<void> {
    await this.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
    await this.$executeRaw`SET LOCAL app.current_user_role = ${role}`;
  }
}
