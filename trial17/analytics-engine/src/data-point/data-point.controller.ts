import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DataPointService } from './data-point.service';
import {
  CreateDataPointDto,
  CreateDataPointBatchDto,
  QueryDataPointsDto,
} from './data-point.dto';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateDataPointDto,
  ) {
    return this.dataPointService.create(req.tenantId, dto);
  }

  @Post('batch')
  async createBatch(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateDataPointBatchDto,
  ) {
    return this.dataPointService.createBatch(req.tenantId, dto);
  }

  @Get()
  async query(
    @Req() req: Request & { tenantId: string },
    @Query() query: QueryDataPointsDto,
  ) {
    return this.dataPointService.query(req.tenantId, query);
  }

  @Get('metrics')
  async getMetrics(@Req() req: Request & { tenantId: string }) {
    return this.dataPointService.getMetrics(req.tenantId);
  }

  @Get('aggregate/:metric')
  async getAggregation(
    @Req() req: Request & { tenantId: string },
    @Param('metric') metric: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dataPointService.getAggregation(
      req.tenantId,
      metric,
      startDate,
      endDate,
    );
  }
}
