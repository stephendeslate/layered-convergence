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

@Controller('datasources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(req.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.dataSourceService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.dataSourceService.findOne(req.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.dataSourceService.remove(req.tenantId, id);
  }

  @Post(':id/config')
  createConfig(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateDataSourceConfigDto,
  ) {
    return this.dataSourceService.createConfig(
      req.tenantId,
      id,
      dto,
    );
  }

  @Put(':id/config')
  updateConfig(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceConfigDto,
  ) {
    return this.dataSourceService.updateConfig(
      req.tenantId,
      id,
      dto,
    );
  }
}
