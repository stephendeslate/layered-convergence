import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';
import { TenantContextModule } from '../tenant-context/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [DataPointService],
  controllers: [DataPointController],
  exports: [DataPointService],
})
export class DataPointModule {}
