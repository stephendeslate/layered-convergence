import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';

@Module({
  providers: [TechnicianService],
  controllers: [TechnicianController],
})
export class TechnicianModule {}
