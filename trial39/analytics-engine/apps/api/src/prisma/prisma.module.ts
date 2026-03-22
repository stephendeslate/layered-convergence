// TRACED:AE-DB-03 — PrismaModule global provider
// TRACED:AE-DB-01 — Schema with 6 models referenced through PrismaModule

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
