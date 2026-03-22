// TRACED:AE-DATA-01 — Prisma schema with all domain models
// TRACED:AE-DATA-02 — @@map on all models and enums, @map on enum values
// TRACED:AE-DATA-03 — Decimal for money fields (cost), @@index on tenant FKs and status
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
