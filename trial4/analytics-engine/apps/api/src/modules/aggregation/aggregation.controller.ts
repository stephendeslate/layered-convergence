import {
  Controller,
  Get,
  Query,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregateQueryDto } from './aggregation.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get()
  async aggregate(
    @Headers('x-tenant-id') tenantId: string,
    @Query() dto: AggregateQueryDto,
  ) {
    return this.aggregationService.aggregate(tenantId, dto);
  }

  @Get('kpi')
  async getKpiSummary(@Headers('x-tenant-id') tenantId: string) {
    return this.aggregationService.getKpiSummary(tenantId);
  }
}
