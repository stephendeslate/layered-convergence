import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

/**
 * Admin endpoints for the aggregation background service.
 * Convention 5.18: background services must have admin endpoints for observability.
 */
@Controller('admin/aggregation')
@UseGuards(ApiKeyGuard)
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post(':dataSourceId/run')
  triggerAggregation(
    @Param('dataSourceId') dataSourceId: string,
    @Query('granularity') granularity?: 'hour' | 'day' | 'week',
  ) {
    return this.aggregationService.aggregate(
      dataSourceId,
      granularity ?? 'day',
    );
  }

  @Get(':dataSourceId/status')
  getStatus(@Param('dataSourceId') dataSourceId: string) {
    return this.aggregationService.getStatus(dataSourceId);
  }
}
