import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.pipelineService.findAllByTenant(tenantId);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.pipelineService.transitionStatus(id, status);
  }

  @Get('count')
  countByTenant(@Query('tenantId') tenantId: string) {
    return this.pipelineService.countByTenantRaw(tenantId);
  }
}
