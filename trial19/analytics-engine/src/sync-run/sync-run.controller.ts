import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto, TransitionSyncRunDto } from './sync-run.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query('dataSourceId') dataSourceId?: string) {
    return this.syncRunService.findAll(req.tenantId, dataSourceId);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.syncRunService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(req.tenantId, dto);
  }

  @Patch(':id/transition')
  async transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: TransitionSyncRunDto,
  ) {
    return this.syncRunService.transition(req.tenantId, id, dto);
  }
}
