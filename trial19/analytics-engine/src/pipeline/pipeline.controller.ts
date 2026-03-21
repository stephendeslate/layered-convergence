import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto, TransitionPipelineDto } from './pipeline.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.pipelineService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pipelineService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePipelineDto) {
    return this.pipelineService.create(req.tenantId, dto);
  }

  @Patch(':id/transition')
  async transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: TransitionPipelineDto,
  ) {
    return this.pipelineService.transition(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pipelineService.remove(req.tenantId, id);
  }
}
