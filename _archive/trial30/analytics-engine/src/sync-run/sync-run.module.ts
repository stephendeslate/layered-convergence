import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';

@Module({
  controllers: [SyncRunController],
  providers: [SyncRunService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
