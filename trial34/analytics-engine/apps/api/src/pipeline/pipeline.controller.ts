import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PipelineService } from './pipeline.service';

@UseGuards(AuthGuard('jwt'))
@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { name: string; config: Record<string, unknown> },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.create(body.name, body.config, req.user.tenantId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.updateStatus(id, body.status, req.user.tenantId);
  }
}
