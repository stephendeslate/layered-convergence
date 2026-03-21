import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto, QueryDataPointsDto } from './data-point.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('data-points')
@UseGuards(ApiKeyGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@CurrentTenant() tenant: { id: string }, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(tenant.id, dto);
  }

  @Get()
  query(@CurrentTenant() tenant: { id: string }, @Query() dto: QueryDataPointsDto) {
    return this.dataPointService.query(
      tenant.id,
      dto.dataSourceId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }
}
