import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('data-points')
@UseGuards(ApiKeyGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(dto);
  }

  @Post('batch')
  createMany(@Body() dtos: CreateDataPointDto[]) {
    return this.dataPointService.createMany(dtos);
  }

  @Get()
  query(@Query() dto: QueryDataPointsDto) {
    return this.dataPointService.query(dto);
  }

  @Get('count')
  count(@Query('dataSourceId') dataSourceId: string) {
    return this.dataPointService.count(dataSourceId);
  }
}
