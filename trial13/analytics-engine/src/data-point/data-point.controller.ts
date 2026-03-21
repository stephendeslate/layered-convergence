import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(req.tenantId!, dto);
  }

  @Get()
  query(
    @Req() req: Request,
    @Query('dataSourceId') dataSourceId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dataPointService.query(req.tenantId!, dataSourceId, startDate, endDate);
  }
}
