import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('data-points')
@UseGuards(JwtAuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(
    @Body() body: { value: string; label: string; dataSourceId: string; timestamp?: Date },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataPointService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(
    @Query('dataSourceId') dataSourceId: string | undefined,
    @Request() req: { user: { tenantId: string } },
  ) {
    if (dataSourceId) {
      return this.dataPointService.findByDataSource(dataSourceId, req.user.tenantId);
    }
    return this.dataPointService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataPointService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataPointService.remove(id, req.user.tenantId);
  }
}
