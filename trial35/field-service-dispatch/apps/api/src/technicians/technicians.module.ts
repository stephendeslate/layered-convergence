// TRACED: FD-TECH-001 — Technicians module
import { Module } from '@nestjs/common';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TechniciansController],
  providers: [TechniciansService, PrismaService],
  exports: [TechniciansService],
})
export class TechniciansModule {}
