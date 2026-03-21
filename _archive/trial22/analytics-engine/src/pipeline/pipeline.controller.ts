import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto, TransitionPipelineDto } from './pipeline.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('pipelines')
@UseGuards(AuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  create(@Body() dto: CreatePipelineDto) {
    return this.pipelineService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipelineService.findOne(id);
  }

  @Get('data-source/:dataSourceId')
  findByDataSourceId(@Param('dataSourceId') dataSourceId: string) {
    return this.pipelineService.findByDataSourceId(dataSourceId);
  }

  @Patch(':id/transition')
  transition(@Param('id') id: string, @Body() dto: TransitionPipelineDto) {
    return this.pipelineService.transition(id, dto);
  }

  @Get(':id/transitions')
  getValidTransitions(@Param('id') id: string) {
    return this.pipelineService.getValidTransitions(id);
  }

  @Get(':id/history')
  getStateHistory(@Param('id') id: string) {
    return this.pipelineService.getStateHistory(id);
  }
}
