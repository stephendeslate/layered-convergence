import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('data-points')
@UseGuards(ApiKeyGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(
    @CurrentTenant() tenant: { id: string },
    @Body() dto: CreateDataPointDto,
  ) {
    return this.dataPointService.create(tenant.id, dto);
  }

  @Get()
  query(
    @CurrentTenant() tenant: { id: string },
    @Query() dto: QueryDataPointsDto,
  ) {
    return this.dataPointService.query(tenant.id, dto);
  }

  @Get('source/:dataSourceId/latest')
  getLatest(@Param('dataSourceId') dataSourceId: string) {
    return this.dataPointService.getLatestBySource(dataSourceId);
  }

  @Get('source/:dataSourceId/count')
  count(@Param('dataSourceId') dataSourceId: string) {
    return this.dataPointService.countBySource(dataSourceId);
  }
}
