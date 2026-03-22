import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { PipelineStatus } from '@analytics-engine/shared';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string; tenantId: string };
}

// TRACED: AE-API-008
@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.pipelinesService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.pipelinesService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      description?: string;
      schedule?: string;
      config?: Record<string, unknown>;
    },
  ) {
    return this.pipelinesService.create(req.user.tenantId, req.user.id, body);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body('status') status: PipelineStatus,
  ) {
    return this.pipelinesService.updateStatus(id, req.user.tenantId, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.pipelinesService.remove(id, req.user.tenantId);
  }
}
