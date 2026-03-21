import { Controller, Get, Query, Req } from '@nestjs/common';
import { AggregationService } from './aggregation.service.js';

@Controller('aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get()
  aggregate(
    @Req() req: any,
    @Query('dataSourceId') dataSourceId: string,
    @Query('bucket') bucket: 'hourly' | 'daily' | 'weekly',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.aggregationService.aggregateByTimeBucket(
      req.tenantId,
      dataSourceId,
      bucket ?? 'daily',
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
