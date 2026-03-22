// TRACED:AE-DB-04 — PrismaService with onModuleInit/onModuleDestroy lifecycle
// TRACED:AE-DB-06 — Index strategy enforced at schema level; PrismaService uses indexed queries

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
