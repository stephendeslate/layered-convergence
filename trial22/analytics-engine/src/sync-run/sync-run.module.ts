// [TRACED:SA-014] SyncRun module with state machine

import { Module } from '@nestjs/common';
import { SyncRunController } from './sync-run.controller';
import { SyncRunService } from './sync-run.service';

@Module({
  controllers: [SyncRunController],
  providers: [SyncRunService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
