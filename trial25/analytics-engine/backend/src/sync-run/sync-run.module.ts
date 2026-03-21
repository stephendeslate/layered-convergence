import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [SyncRunService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
