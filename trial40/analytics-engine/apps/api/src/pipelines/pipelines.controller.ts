// TRACED:AE-PERF-07 — Pipelines controller with Cache-Control headers on list
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
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  async create(@Body() dto: CreatePipelineDto): Promise<Record<string, unknown>> {
    return this.pipelinesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.pipelinesService.findAll(
      tenantId,
      parseInt(page, 10) || 1,
      parseInt(pageSize, 10) || 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.pipelinesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ): Promise<Record<string, unknown>> {
    return this.pipelinesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.pipelinesService.remove(id);
  }
}
