import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: pg.Pool;

  constructor() {
    const connectionString = process.env['DATABASE_URL'] ?? 'postgresql://test:test@localhost:5433/test';
    const pool = new pg.Pool({ connectionString });
    // Type assertion justified: duplicate @types/pg between root and @prisma/adapter-pg causes incompatible Pool types
    const adapter = new PrismaPg(pool as never);
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
