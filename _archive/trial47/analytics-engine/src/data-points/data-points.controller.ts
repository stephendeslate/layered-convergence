import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { DataPointsService } from './data-points.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('data-points')
@UseFilters(PrismaExceptionFilter)
export class DataPointsController {
  constructor(private readonly dataPointsService: DataPointsService) {}

  @Post()
  create(@Body() dto: CreateDataPointDto) {
    return this.dataPointsService.create(dto);
  }

  @Post('batch')
  createMany(@Body() dtos: CreateDataPointDto[]) {
    return this.dataPointsService.createMany(dtos);
  }

  @Get()
  findByDataSource(
    @Query('dataSourceId') dataSourceId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dataPointsService.findByDataSource(
      dataSourceId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }
}
