import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service.js';
import { AggregationController } from './aggregation.controller.js';

@Module({
  controllers: [AggregationController],
  providers: [AggregationService],
  exports: [AggregationService],
})
export class AggregationModule {}
