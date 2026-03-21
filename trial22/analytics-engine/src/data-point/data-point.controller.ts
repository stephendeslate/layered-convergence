// [TRACED:AC-010] DataPoint controller with tenant-scoped endpoints

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('data-points')
@UseGuards(JwtAuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('dataSourceId') dataSourceId?: string,
  ) {
    if (dataSourceId) {
      return this.dataPointService.findByDataSource(
        dataSourceId,
        req.user.tenantId,
      );
    }
    return this.dataPointService.findAll(req.user.tenantId);
  }

  @Post()
  create(
    @Body()
    body: {
      key: string;
      value: string;
      dataSourceId: string;
      timestamp?: Date;
    },
    @Request() req: AuthRequest,
  ) {
    return this.dataPointService.create({
      ...body,
      tenantId: req.user.tenantId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.dataPointService.remove(id, req.user.tenantId);
  }
}
