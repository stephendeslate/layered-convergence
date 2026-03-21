import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { TransitionPipelineDto } from './dto/transition-pipeline.dto';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.findById(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreatePipelineDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.create(dto, req.user.tenantId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionPipelineDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.transition(id, dto.state, req.user.tenantId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.delete(id, req.user.tenantId);
  }
}
