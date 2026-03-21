import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('sync-runs')
@UseGuards(ApiKeyGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get('data-source/:dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.syncRunService.findById(id);
  }
}
