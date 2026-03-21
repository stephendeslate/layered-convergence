import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SyncRunService],
  controllers: [SyncRunController],
  exports: [SyncRunService],
})
export class SyncRunModule {}
