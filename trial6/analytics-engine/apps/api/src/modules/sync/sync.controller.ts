import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';
import { SyncHistoryQueryDto } from './dto/sync-history-query.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger')
  triggerSync(@Body() dto: TriggerSyncDto) {
    return this.syncService.triggerSync(dto);
  }

  @Get('history')
  getHistory(@Query() query: SyncHistoryQueryDto) {
    return this.syncService.getHistory(query);
  }

  @Get(':id')
  getRunById(@Param('id') id: string) {
    return this.syncService.getRunById(id);
  }
}
