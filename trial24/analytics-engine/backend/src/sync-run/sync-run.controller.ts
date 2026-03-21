import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncRunStatus } from '@prisma/client';

@Controller('sync-runs')
@UseGuards(JwtAuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  create(
    @Body() body: { dataSourceId: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.syncRunService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.syncRunService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.syncRunService.findOne(id, req.user.tenantId);
  }

  @Put(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: SyncRunStatus; errorMessage?: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.syncRunService.transition(id, req.user.tenantId, body.status, body.errorMessage);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.syncRunService.remove(id, req.user.tenantId);
  }
}
