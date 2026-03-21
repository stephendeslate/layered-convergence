import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PipelineService } from './pipeline.service.js';

@Controller('data-sources')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post(':id/sync')
  triggerSync(@Req() req: Request, @Param('id') id: string) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.pipelineService.triggerSync(id, tenantId);
  }

  @Get(':id/sync-runs')
  getSyncRuns(@Param('id') id: string) {
    return this.pipelineService.getSyncRuns(id);
  }
}
