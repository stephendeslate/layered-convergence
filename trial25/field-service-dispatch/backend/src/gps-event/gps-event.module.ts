import { Module } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [GpsEventService],
  exports: [GpsEventService],
})
export class GpsEventModule {}
