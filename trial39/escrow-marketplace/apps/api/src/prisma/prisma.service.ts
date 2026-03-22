// TRACED: EM-DB-001 — Prisma service with lifecycle hooks
// TRACED: EM-DB-002 — @@map on all models and enums with @map on enum values
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async checkDatabaseHealth(): Promise<boolean> {
    const result = await this.$executeRaw(Prisma.sql`SELECT 1`);
    return result === 1;
  }
}
