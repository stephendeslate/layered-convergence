import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service.js';
import { TechnicianController } from './technician.controller.js';

@Module({
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
