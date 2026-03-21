import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SyncRunController],
  providers: [SyncRunService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
