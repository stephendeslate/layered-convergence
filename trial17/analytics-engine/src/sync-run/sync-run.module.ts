import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';

@Module({
  providers: [SyncRunService],
  controllers: [SyncRunController],
  exports: [SyncRunService],
})
export class SyncRunModule {}
