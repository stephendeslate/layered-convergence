import { Module } from '@nestjs/common';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TechnicianController],
  providers: [TechnicianService, PrismaService],
})
export class TechnicianModule {}
