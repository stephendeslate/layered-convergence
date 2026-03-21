import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  TransitionPipelineDto,
} from './pipeline.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('pipelines')
@UseGuards(AuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreatePipelineDto) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.create(tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.update(tenantId, id, dto);
  }

  @Patch(':id/transition')
  transition(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: TransitionPipelineDto,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.transition(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.pipelineService.remove(tenantId, id);
  }
}
