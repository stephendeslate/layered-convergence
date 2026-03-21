import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './data-point.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('dataSourceId') dataSourceId?: string,
    @Query('metric') metric?: string,
  ) {
    return this.dataPointService.findAll(req.tenantId, dataSourceId, metric);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(req.tenantId, dto);
  }
}
