import { Controller, Get, Query, Req } from '@nestjs/common';
import { AggregationService } from './aggregation.service.js';
import { AggregationQueryDto } from './dto/aggregation-query.dto.js';
import { Request } from 'express';

@Controller('aggregations')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get()
  aggregate(@Req() req: Request, @Query() query: AggregationQueryDto) {
    return this.aggregationService.aggregate(
      (req as any).tenantId,
      query.dataSourceId,
      query.bucket,
      query.startDate,
      query.endDate,
      query.metricKey,
    );
  }
}
