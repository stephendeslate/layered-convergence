import { Controller, Get, Query } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { QueryDataPointsDto } from './dto/query-data-points.dto';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get()
  query(@Query() dto: QueryDataPointsDto) {
    return this.dataPointService.query(dto);
  }

  @Get('aggregated')
  getAggregated(
    @Query('tenantId') tenantId: string,
    @Query('dataSourceId') dataSourceId: string,
    @Query('granularity') granularity: 'hour' | 'day' | 'week' = 'day',
  ) {
    return this.dataPointService.getAggregated(tenantId, dataSourceId, granularity);
  }
}
