import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.pipelineService.findAllByTenant(tenantId);
  }

  @Get('count')
  async count(@Query('tenantId') tenantId: string) {
    const count = await this.pipelineService.countByTenantRaw(tenantId);
    return { count };
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.pipelineService.transitionStatus(id, status);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return this.pipelineService.activatePipeline(id);
  }
}
