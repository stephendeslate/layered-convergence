import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { DataSourceService } from './datasource.service.js';
import {
  CreateDataSourceDto,
  CreateDataSourceConfigDto,
} from './dto/create-datasource.dto.js';
import {
  UpdateDataSourceDto,
  UpdateDataSourceConfigDto,
} from './dto/update-datasource.dto.js';
import { Request } from 'express';

@Controller('datasources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create((req as any).tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.dataSourceService.findAll((req as any).tenantId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.findOne((req as any).tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update((req as any).tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.remove((req as any).tenantId, id);
  }

  @Post(':id/config')
  createConfig(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateDataSourceConfigDto,
  ) {
    return this.dataSourceService.createConfig(
      (req as any).tenantId,
      id,
      dto,
    );
  }

  @Put(':id/config')
  updateConfig(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceConfigDto,
  ) {
    return this.dataSourceService.updateConfig(
      (req as any).tenantId,
      id,
      dto,
    );
  }
}
