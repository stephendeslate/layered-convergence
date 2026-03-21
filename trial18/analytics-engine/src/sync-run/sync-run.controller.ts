import { Controller, Get, Post, Patch, Param, Body, Req, Query } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Query('dataSourceId') dataSourceId?: string) {
    return this.syncRunService.findAll(req.tenantId, dataSourceId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.syncRunService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateSyncRunDto) {
    return this.syncRunService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSyncRunDto,
  ) {
    return this.syncRunService.update(req.tenantId, id, dto);
  }
}
