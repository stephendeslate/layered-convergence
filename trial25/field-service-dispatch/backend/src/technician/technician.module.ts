import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
