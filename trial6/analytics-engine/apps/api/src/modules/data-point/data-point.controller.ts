import { Controller, Get, Query, Param } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { QueryDataPointDto } from './dto/query-data-point.dto';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get()
  query(@Query() dto: QueryDataPointDto) {
    return this.dataPointService.query(dto);
  }

  @Get(':dataSourceId/latest')
  getLatest(@Param('dataSourceId') dataSourceId: string) {
    return this.dataPointService.getLatest(dataSourceId);
  }
}
