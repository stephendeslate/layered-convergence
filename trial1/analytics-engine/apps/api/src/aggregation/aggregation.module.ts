import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregationProcessor } from './aggregation.processor';

@Module({
  providers: [AggregationService, AggregationProcessor],
  exports: [AggregationService, AggregationProcessor],
})
export class AggregationModule {}
