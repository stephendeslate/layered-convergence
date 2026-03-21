import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregateQueryDto } from './dto/aggregate-query.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('aggregation')
@UseGuards(ApiKeyGuard)
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get()
  aggregate(
    @CurrentTenant() tenant: { id: string },
    @Query() dto: AggregateQueryDto,
  ) {
    return this.aggregationService.aggregate(
      tenant.id,
      dto.dataSourceId,
      dto.bucket,
      dto.startDate,
      dto.endDate,
      dto.metric,
    );
  }

  /** Admin endpoint: manually trigger aggregation for a data source. */
  @Post('run/:dataSourceId')
  runAggregation(@Param('dataSourceId') dataSourceId: string) {
    return this.aggregationService.runAggregationJob(dataSourceId);
  }
}
