import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(dto);
  }

  @Get()
  findAllByTenant(@Query('tenantId') tenantId: string) {
    return this.dataSourceService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dataSourceService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.dataSourceService.delete(id);
  }
}
