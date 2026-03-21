import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Controller('data-source-configs')
export class DataSourceConfigController {
  constructor(private readonly dataSourceConfigService: DataSourceConfigService) {}

  @Post()
  create(@Body() dto: CreateDataSourceConfigDto) {
    return this.dataSourceConfigService.create(dto);
  }

  @Get('by-source/:dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.dataSourceConfigService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataSourceConfigService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceConfigDto) {
    return this.dataSourceConfigService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourceConfigService.remove(id);
  }
}
