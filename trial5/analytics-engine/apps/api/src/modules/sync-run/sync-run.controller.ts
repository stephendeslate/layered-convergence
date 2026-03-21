import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  triggerSync(@Body() dto: TriggerSyncDto) {
    return this.syncRunService.triggerSync(dto);
  }

  @Get()
  findByDataSource(@Query('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.syncRunService.findById(id);
  }
}
