import { Module } from '@nestjs/common';
import { SyncRunsService } from './sync-runs.service';
import { SyncRunsController } from './sync-runs.controller';

@Module({
  controllers: [SyncRunsController],
  providers: [SyncRunsService],
  exports: [SyncRunsService],
})
export class SyncRunsModule {}
