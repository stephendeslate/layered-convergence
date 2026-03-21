import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Controller('data-source-configs')
export class DataSourceConfigController {
  constructor(private readonly configService: DataSourceConfigService) {}

  @Post()
  create(@Body() dto: CreateDataSourceConfigDto) {
    return this.configService.create(dto);
  }

  @Get(':dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.configService.findByDataSource(dataSourceId);
  }

  @Put(':dataSourceId')
  update(@Param('dataSourceId') dataSourceId: string, @Body() dto: UpdateDataSourceConfigDto) {
    return this.configService.update(dataSourceId, dto);
  }

  @Delete(':dataSourceId')
  remove(@Param('dataSourceId') dataSourceId: string) {
    return this.configService.remove(dataSourceId);
  }
}
