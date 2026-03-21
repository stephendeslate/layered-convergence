import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './data-point.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query('metric') metric?: string) {
    return this.dataPointService.findAll(req.tenantId, metric);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(req.tenantId, dto);
  }

  @Post('batch')
  async createBatch(@Req() req: AuthenticatedRequest, @Body() dtos: CreateDataPointDto[]) {
    return this.dataPointService.createBatch(req.tenantId, dtos);
  }
}
