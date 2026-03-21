import { Controller, Get, Param } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';

@Controller('sync-runs')
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Get('data-source/:dataSourceId')
  findByDataSource(@Param('dataSourceId') dataSourceId: string) {
    return this.syncRunService.findByDataSource(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncRunService.findOne(id);
  }
}
