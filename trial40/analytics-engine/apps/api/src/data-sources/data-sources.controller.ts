// TRACED:AE-API-06 — DataSources controller with full CRUD and Cache-Control
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  async create(@Body() dto: CreateDataSourceDto): Promise<Record<string, unknown>> {
    return this.dataSourcesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dataSourcesService.findAll(
      tenantId,
      parseInt(page, 10) || 1,
      parseInt(pageSize, 10) || 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.dataSourcesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ): Promise<Record<string, unknown>> {
    return this.dataSourcesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.dataSourcesService.remove(id);
  }
}
