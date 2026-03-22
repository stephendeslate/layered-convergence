// TRACED:AE-API-05 — PipelinesController full CRUD with normalizePageParams and Cache-Control
// TRACED:AE-PERF-10 — Pipeline list uses normalizePageParams and Cache-Control headers

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') rawPage?: string,
    @Query('pageSize') rawPageSize?: string,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const { page, pageSize } = normalizePageParams(
      Number(rawPage) || 1,
      Number(rawPageSize) || 20,
    );

    res?.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');

    return this.pipelinesService.findAll({ page, pageSize, tenantId, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pipelinesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePipelineDto) {
    return this.pipelinesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.pipelinesService.remove(id);
  }
}
