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
   * Set a Postgres session-level config variable.
   * Useful for RLS or audit context.
   */
  async setConfig(key: string, value: string): Promise<void> {
    // Using $executeRaw with tagged template (safe parameterized query)
    await this.$executeRaw`SELECT set_config(${key}, ${value}, false)`;
  }
}
