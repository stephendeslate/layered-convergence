import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Request() req: { user: { tenantId: string } }, @Body() body: { name: string; type: string; config?: Record<string, unknown> }) {
    return this.dataSourceService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req: { user: { tenantId: string } }, @Body() body: { name?: string; config?: Record<string, unknown> }) {
    return this.dataSourceService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }
}
