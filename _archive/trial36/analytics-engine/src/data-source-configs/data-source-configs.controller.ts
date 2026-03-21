import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { DataSourceConfigsService } from './data-source-configs.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('data-source-configs')
@UseFilters(PrismaExceptionFilter)
export class DataSourceConfigsController {
  constructor(private readonly service: DataSourceConfigsService) {}

  @Post()
  create(@Body() dto: CreateDataSourceConfigDto) {
    return this.service.create(dto);
  }

  @Get(':dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.service.findByDataSource(dataSourceId);
  }

  @Patch(':dataSourceId')
  update(
    @Param('dataSourceId') dataSourceId: string,
    @Body() dto: UpdateDataSourceConfigDto,
  ) {
    return this.service.update(dataSourceId, dto);
  }

  @Delete(':dataSourceId')
  remove(@Param('dataSourceId') dataSourceId: string) {
    return this.service.remove(dataSourceId);
  }
}
