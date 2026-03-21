// [TRACED:AC-018] SyncRun controller with transition endpoint

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncRunStatus } from '@prisma/client';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('sync-runs')
@UseGuards(JwtAuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('dataSourceId') dataSourceId?: string,
  ) {
    if (dataSourceId) {
      return this.syncRunService.findByDataSource(
        dataSourceId,
        req.user.tenantId,
      );
    }
    return this.syncRunService.findAll(req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { dataSourceId: string },
    @Request() req: AuthRequest,
  ) {
    return this.syncRunService.create({
      dataSourceId: body.dataSourceId,
      tenantId: req.user.tenantId,
    });
  }

  @Put(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: SyncRunStatus; error?: string },
    @Request() req: AuthRequest,
  ) {
    return this.syncRunService.transition(
      id,
      req.user.tenantId,
      body.status,
      body.error,
    );
  }
}
