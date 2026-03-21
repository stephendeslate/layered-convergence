import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { AggregationModule } from '../aggregation/aggregation.module';
import { PrismaService } from '../../config/prisma.service';

@Module({
  imports: [AggregationModule],
  controllers: [SseController],
  providers: [PrismaService],
})
export class SseModule {}
