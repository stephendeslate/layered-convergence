import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto, CreateBatchDataPointsDto, QueryDataPointsDto } from './data-point.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateDataPointDto,
  ) {
    return this.dataPointService.create(tenantId, dto);
  }

  @Post('batch')
  async createBatch(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBatchDataPointsDto,
  ) {
    return this.dataPointService.createBatch(tenantId, dto.dataSourceId, dto.points);
  }

  @Get()
  async query(
    @Headers('x-tenant-id') tenantId: string,
    @Query() dto: QueryDataPointsDto,
  ) {
    return this.dataPointService.query(tenantId, dto);
  }

  @Get('count')
  async count(
    @Headers('x-tenant-id') tenantId: string,
    @Query('dataSourceId') dataSourceId?: string,
  ) {
    const count = await this.dataPointService.count(tenantId, dataSourceId);
    return { count };
  }
}
