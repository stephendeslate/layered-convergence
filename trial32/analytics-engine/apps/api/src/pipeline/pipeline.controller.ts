import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipelineStatus } from '@prisma/client';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  create(@Request() req: { user: { tenantId: string } }, @Body() body: { name: string; config?: Record<string, unknown> }) {
    return this.pipelineService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
    @Body() body: { name?: string; config?: Record<string, unknown> },
  ) {
    return this.pipelineService.update(id, req.user.tenantId, body);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
    @Body() body: { status: PipelineStatus },
  ) {
    return this.pipelineService.transition(id, req.user.tenantId, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.remove(id, req.user.tenantId);
  }
}
