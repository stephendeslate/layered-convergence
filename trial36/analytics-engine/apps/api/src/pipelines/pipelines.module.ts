import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../prisma.service';

// TRACED: AE-API-005
@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, PrismaService],
})
export class PipelinesModule {}
