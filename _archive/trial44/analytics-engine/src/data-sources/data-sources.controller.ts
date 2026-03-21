import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('data-sources')
@UseFilters(PrismaExceptionFilter)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  create(@Body() dto: CreateDataSourceDto) {
    return this.dataSourcesService.create(dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.dataSourcesService.findAll(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dataSourcesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourcesService.remove(id);
  }
}
