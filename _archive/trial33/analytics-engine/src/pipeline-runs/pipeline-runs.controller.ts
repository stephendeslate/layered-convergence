import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PipelineRunsService } from './pipeline-runs.service';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto';
import { CompletePipelineRunDto } from './dto/complete-pipeline-run.dto';

@Controller('pipeline-runs')
export class PipelineRunsController {
  constructor(private readonly pipelineRunsService: PipelineRunsService) {}

  @Get()
  findAll(@Query('pipelineId') pipelineId: string) {
    return this.pipelineRunsService.findAll(pipelineId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipelineRunsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePipelineRunDto) {
    return this.pipelineRunsService.create(dto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompletePipelineRunDto) {
    return this.pipelineRunsService.complete(id, dto.rowsIngested);
  }

  @Patch(':id/fail')
  fail(@Param('id') id: string, @Body('errorLog') errorLog: string) {
    return this.pipelineRunsService.fail(id, errorLog);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pipelineRunsService.remove(id);
  }
}
