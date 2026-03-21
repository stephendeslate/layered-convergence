import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('data-points')
@UseGuards(AuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(this.getTenantId(req), dto);
  }

  @Post('batch')
  createBatch(@Req() req: Request, @Body() dtos: CreateDataPointDto[]) {
    return this.dataPointService.createBatch(this.getTenantId(req), dtos);
  }

  @Get()
  query(@Req() req: Request, @Query() queryDto: QueryDataPointsDto) {
    return this.dataPointService.query(this.getTenantId(req), queryDto);
  }

  @Get('metrics')
  getMetrics(@Req() req: Request) {
    return this.dataPointService.getMetrics(this.getTenantId(req));
  }
}
