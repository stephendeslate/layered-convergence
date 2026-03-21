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

  async setUserContext(userId: string) {
    await this.$executeRaw`SET app.current_user_id = ${userId}`;
  }

  async clearUserContext() {
    await this.$executeRaw`RESET app.current_user_id`;
  }
}
