import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataPointService } from './data-point.service.js';
import { QueryDataPointsDto } from './dto/query-data-points.dto.js';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post('query')
  query(@Req() req: Request, @Body() dto: QueryDataPointsDto) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataPointService.query(tenantId, dto);
  }
}
