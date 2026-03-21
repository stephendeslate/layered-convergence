import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [TechnicianController],
  providers: [TechnicianService, PrismaService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
