import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipelineService } from './pipeline.service';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; config?: object },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.pipelineService.transition(id, req.user.tenantId, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.pipelineService.remove(id, req.user.tenantId);
  }
}
