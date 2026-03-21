import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor(configService: ConfigService) {
    const pool = new Pool({
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5433),
      user: configService.get<string>('DB_USER', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_NAME', 'escrow_marketplace_test'),
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  async truncateAll() {
    const tableNames = [
      'WebhookLog',
      'Payout',
      'StripeConnectedAccount',
      'Dispute',
      'TransactionStateHistory',
      'Transaction',
      'User',
    ];
    for (const table of tableNames) {
      await this.$executeRaw`TRUNCATE TABLE "${table}" CASCADE`;
    }
  }
}
