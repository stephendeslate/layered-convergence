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

  @Post('batch')
  createBatch(
    @CurrentTenant() tenant: { id: string },
    @Body() dataPoints: CreateDataPointDto[],
  ) {
    return this.dataPointService.createBatch(tenant.id, dataPoints);
  }

  @Get('source/:dataSourceId')
  findByDataSource(
    @CurrentTenant() tenant: { id: string },
    @Param('dataSourceId') dataSourceId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dataPointService.findByDataSource(
      tenant.id,
      dataSourceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
