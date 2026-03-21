import {
  Controller,
  Post,
  Body,
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

  @Post('query')
  query(
    @CurrentTenant() tenant: { id: string },
    @Body() dto: AggregateQueryDto,
  ) {
    return this.aggregationService.aggregate(
      tenant.id,
      dto.dataSourceId,
      dto.granularity,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }
}
