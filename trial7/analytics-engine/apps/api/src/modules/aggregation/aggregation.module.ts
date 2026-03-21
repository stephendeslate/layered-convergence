import { Module } from '@nestjs/common';
import { AggregationController } from './aggregation.controller';
import { AggregationService } from './aggregation.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AggregationController],
  providers: [AggregationService, PrismaService],
  exports: [AggregationService],
})
export class AggregationModule {}
