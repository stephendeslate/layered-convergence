import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { DataPointService } from './datapoint.service.js';
import { CreateDataPointDto } from './dto/create-datapoint.dto.js';
import { QueryDataPointDto } from './dto/query-datapoint.dto.js';

@Controller('datapoints')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(req.tenantId, dto);
  }

  @Get()
  query(@Req() req: any, @Query() query: QueryDataPointDto) {
    return this.dataPointService.query(req.tenantId, query);
  }
}
