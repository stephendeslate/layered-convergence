import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QueryService } from './query.service';
import { ExecuteQueryDto } from './dto/execute-query.dto';

@Controller('api/query')
@UseGuards(JwtAuthGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async executeQuery(
    @CurrentTenant() tenantId: string,
    @CurrentUser('tier') tier: string,
    @Body() dto: ExecuteQueryDto,
  ) {
    const data = await this.queryService.executeQuery(
      {
        dataSourceId: dto.dataSourceId,
        tenantId,
        dimensionField: dto.dimensionField,
        metricFields: dto.metricFields,
        dateRange: {
          preset: dto.dateRangePreset ?? 'LAST_30_DAYS',
          start: dto.dateStart ? new Date(dto.dateStart) : undefined,
          end: dto.dateEnd ? new Date(dto.dateEnd) : undefined,
        },
        groupingPeriod: dto.groupingPeriod ?? 'DAILY',
        filters: dto.filters,
        limit: dto.limit,
        offset: dto.offset,
      },
      tier,
    );
    return { data };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async previewQuery(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExecuteQueryDto,
  ) {
    const data = await this.queryService.previewQuery({
      dataSourceId: dto.dataSourceId,
      tenantId,
      dimensionField: dto.dimensionField,
      metricFields: dto.metricFields,
      dateRange: {
        preset: dto.dateRangePreset ?? 'LAST_30_DAYS',
        start: dto.dateStart ? new Date(dto.dateStart) : undefined,
        end: dto.dateEnd ? new Date(dto.dateEnd) : undefined,
      },
      groupingPeriod: dto.groupingPeriod ?? 'DAILY',
      filters: dto.filters,
      limit: dto.limit,
      offset: dto.offset,
    });
    return { data };
  }
}
