import { Module } from '@nestjs/common';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [TechnicianController],
  providers: [TechnicianService, PrismaService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
