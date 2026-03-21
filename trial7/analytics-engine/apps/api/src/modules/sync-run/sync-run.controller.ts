import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('sync-runs')
@UseGuards(ApiKeyGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncRunService.findOneOrThrow(id);
  }

  @Post(':dataSourceId/trigger')
  triggerSync(@Param('dataSourceId') dataSourceId: string) {
    return this.syncRunService.create(dataSourceId);
  }
}
