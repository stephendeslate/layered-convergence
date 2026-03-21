import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';
import { TenantContextModule } from '../tenant-context/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [SyncRunService],
  controllers: [SyncRunController],
  exports: [SyncRunService],
})
export class SyncRunModule {}
