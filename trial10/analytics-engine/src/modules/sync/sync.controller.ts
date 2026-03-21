import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { TriggerSyncDto, BackfillDto } from './dto/trigger-sync.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('sync')
@UseGuards(ApiKeyGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger')
  triggerSync(@Body() dto: TriggerSyncDto) {
    return this.syncService.triggerSync(dto.dataSourceId);
  }

  @Post('backfill')
  backfill(@Body() dto: BackfillDto) {
    return this.syncService.backfill(
      dto.dataSourceId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('history/:dataSourceId')
  getSyncHistory(@Param('dataSourceId') dataSourceId: string) {
    return this.syncService.getSyncHistory(dataSourceId);
  }
}
