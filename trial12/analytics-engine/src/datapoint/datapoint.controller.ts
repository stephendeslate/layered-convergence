import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { DataPointService } from './datapoint.service.js';
import { CreateDataPointDto } from './dto/create-datapoint.dto.js';
import { QueryDataPointDto } from './dto/query-datapoint.dto.js';
import { Request } from 'express';

@Controller('datapoints')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create((req as any).tenantId, dto);
  }

  @Get()
  query(@Req() req: Request, @Query() query: QueryDataPointDto) {
    return this.dataPointService.query((req as any).tenantId, query);
  }
}
