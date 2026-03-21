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

  /**
   * Set RLS context for tenant isolation.
   * Uses Prisma.sql tagged template — never $executeRawUnsafe.
   */
  async setRLSContext(userId: string, role: string): Promise<void> {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_role', ${role}, true)`,
    );
  }
}
