import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(req.tenantId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.dataSourceService.findAll(req.tenantId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.findOne(req.tenantId!, id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourceService.update(req.tenantId!, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.remove(req.tenantId!, id);
  }
}
