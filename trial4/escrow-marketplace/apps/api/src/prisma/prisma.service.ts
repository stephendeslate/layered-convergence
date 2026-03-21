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
   * Set user context for RLS policies.
   * Supports dual-party isolation pattern (v4.0 Section 5.14).
   */
  async setUserContext(userId: string, role?: string) {
    await this.$executeRawUnsafe(
      `SET app.current_user_id = '${userId}'`,
    );
    if (role) {
      await this.$executeRawUnsafe(
        `SET app.current_user_role = '${role}'`,
      );
    }
  }
}
