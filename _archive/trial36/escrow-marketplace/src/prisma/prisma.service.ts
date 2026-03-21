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

  constructor(private config: ConfigService) {
    const pool = new Pool({
      host: config.get('DATABASE_HOST', 'localhost'),
      port: config.get<number>('DATABASE_PORT', 5432),
      user: config.get('DATABASE_USER', 'postgres'),
      password: config.get('DATABASE_PASSWORD', 'postgres'),
      database: config.get('DATABASE_NAME', 'escrow_marketplace'),
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
}
