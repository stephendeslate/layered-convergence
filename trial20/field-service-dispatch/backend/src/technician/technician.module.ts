import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { CompanyContextModule } from '../company-context/company-context.module';

@Module({
  imports: [CompanyContextModule],
  providers: [TechnicianService],
  controllers: [TechnicianController],
  exports: [TechnicianService],
})
export class TechnicianModule {}
