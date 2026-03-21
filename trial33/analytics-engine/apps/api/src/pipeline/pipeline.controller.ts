import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PipelineService } from './pipeline.service';
import type { PipelineStatus } from '@analytics-engine/shared';

// TRACED: AE-API-PIPE-LIST-001 — Pipeline endpoints with JWT guard
@Controller('pipelines')
@UseGuards(AuthGuard('jwt'))
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Patch('runs/:id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: PipelineStatus },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.transition(id, body.status, req.user.tenantId);
  }
}
