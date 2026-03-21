import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('data-points')
@UseGuards(JwtAuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Request() req: { user: { tenantId: string } }, @Body() body: { value: number; label: string; dataSourceId: string }) {
    return this.dataPointService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
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
