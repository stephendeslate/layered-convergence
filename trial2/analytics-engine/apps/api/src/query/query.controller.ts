import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { QueryService } from './query.service';
import { QueryDto } from './dto/query.dto';
import { Request } from 'express';

@Controller('api/v1/query')
@UseGuards(AuthGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  async query(
    @Req() req: Request & { user: { tenantId: string } },
    @Body() dto: QueryDto,
  ) {
    return this.queryService.execute(req.user.tenantId, {
      dataSourceId: dto.dataSourceId,
      metrics: dto.metrics,
      dimensions: dto.dimensions,
      dateRange: dto.dateRange,
      groupBy: dto.groupBy,
      filters: dto.filters,
      limit: dto.limit,
    });
  }
}
