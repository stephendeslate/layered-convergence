// TRACED: AE-PIPE-001 — Pipelines module
import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, PrismaService],
  exports: [PipelinesService],
})
export class PipelinesModule {}
