import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PipelineService } from './pipeline.service';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  TransitionPipelineDto,
} from './pipeline.dto';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreatePipelineDto,
  ) {
    return this.pipelineService.create(req.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request & { tenantId: string }) {
    return this.pipelineService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.pipelineService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelineService.update(req.tenantId, id, dto);
  }

  @Patch(':id/transition')
  async transition(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: TransitionPipelineDto,
  ) {
    return this.pipelineService.transition(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.pipelineService.remove(req.tenantId, id);
  }
}
