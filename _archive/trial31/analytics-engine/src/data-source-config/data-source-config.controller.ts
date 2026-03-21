import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Controller('data-source-configs')
export class DataSourceConfigController {
  constructor(private readonly service: DataSourceConfigService) {}

  @Post()
  create(@Body() dto: CreateDataSourceConfigDto) {
    return this.service.create(dto);
  }

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.service.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceConfigDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
