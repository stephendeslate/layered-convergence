import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregateQueryDto } from './aggregation.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('aggregations')
@UseGuards(ApiKeyGuard)
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get()
  aggregate(@CurrentTenant() tenant: { id: string }, @Query() dto: AggregateQueryDto) {
    return this.aggregationService.aggregate(
      tenant.id,
      dto.dataSourceId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.bucket as 'hourly' | 'daily' | 'weekly',
    );
  }
}
