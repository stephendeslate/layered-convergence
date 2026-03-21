import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto, QueryDataPointsDto } from './data-point.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('data-points')
@UseGuards(AuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(tenantId, dto);
  }

  @Get()
  query(@TenantId() tenantId: string, @Query() dto: QueryDataPointsDto) {
    return this.dataPointService.query(tenantId, dto);
  }
}
