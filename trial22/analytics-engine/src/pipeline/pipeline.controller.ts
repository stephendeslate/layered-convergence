// [TRACED:AC-012] Pipeline controller with transition endpoint

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipelineStatus } from '@prisma/client';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.pipelineService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string; config?: object },
    @Request() req: AuthRequest,
  ) {
    return this.pipelineService.create({
      ...body,
      tenantId: req.user.tenantId,
    });
  }

  @Put(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: PipelineStatus },
    @Request() req: AuthRequest,
  ) {
    return this.pipelineService.transition(id, req.user.tenantId, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.pipelineService.remove(id, req.user.tenantId);
  }
}
