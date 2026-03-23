import { Controller, Get, Post, Put, Delete, Body, Param, Query, Header } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-sources.dto';

// TRACED:AE-API-006
@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  create(@Body() dto: CreateDataSourceDto) {
    return this.dataSourcesService.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dataSourcesService.findAll(
      tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataSourcesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourcesService.remove(id);
  }
}
