import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/field_service';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }

  async truncateAll(): Promise<void> {
    const tableNames = [
      'work_order_status_history',
      'job_photos',
      'invoices',
      'work_orders',
      'routes',
      'customers',
      'technicians',
      'users',
      'companies',
    ];
    for (const table of tableNames) {
      await this.$executeRaw`TRUNCATE TABLE ${Prisma.raw(`"${table}"`)} CASCADE`;
    }
  }
}
