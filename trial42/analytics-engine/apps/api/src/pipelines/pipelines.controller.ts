import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Header } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './pipelines.dto';

// TRACED:AE-API-012
@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  create(@Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.pipelinesService.findAll(
      tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipelinesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePipelineDto) {
    return this.pipelinesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pipelinesService.remove(id);
  }
}
