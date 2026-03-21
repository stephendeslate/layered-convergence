import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSourceService } from './data-source.service.js';
import { CreateDataSourceDto } from './dto/create-data-source.dto.js';
import { UpdateDataSourceDto } from './dto/update-data-source.dto.js';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataSourceService.create(tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataSourceService.findAll(tenantId);
  }

  @Get(':id')
  findById(@Req() req: Request, @Param('id') id: string) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataSourceService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataSourceService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dataSourceService.remove(tenantId, id);
  }
}
