import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import {
  CreateDataPointDto,
  CreateDataPointBatchDto,
  QueryDataPointsDto,
} from './data-point.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.dto';

@Controller('data-points')
@UseGuards(AuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateDataPointDto,
  ) {
    return this.dataPointService.create(req.user.tenantId, dto);
  }

  @Post('batch')
  createBatch(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateDataPointBatchDto,
  ) {
    return this.dataPointService.createBatch(req.user.tenantId, dto);
  }

  @Get()
  query(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: QueryDataPointsDto,
  ) {
    return this.dataPointService.query(req.user.tenantId, query);
  }

  @Get('metrics')
  getMetrics(@Req() req: Request & { user: JwtPayload }) {
    return this.dataPointService.getMetrics(req.user.tenantId);
  }

  @Get('aggregation/:metric')
  getAggregation(
    @Req() req: Request & { user: JwtPayload },
    @Param('metric') metric: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dataPointService.getAggregation(
      req.user.tenantId,
      metric,
      startDate,
      endDate,
    );
  }
}
