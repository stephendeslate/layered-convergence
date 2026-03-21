import { Controller, Get, Post, Body } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { TriggerAggregationDto } from './dto/trigger-aggregation.dto';

/**
 * Admin endpoint for triggering and monitoring the aggregation background service.
 * Addresses SDD v6.0 Convention 5.18 — background service observability.
 */
@Controller('admin/aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post('run')
  triggerAggregation(@Body() dto: TriggerAggregationDto) {
    return this.aggregationService.triggerAggregation(dto);
  }

  @Get('status')
  getStatus() {
    return this.aggregationService.getStatus();
  }
}
