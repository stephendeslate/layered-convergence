// TRACED: FD-TECH-005 — Technicians module
import { Module } from '@nestjs/common';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';

@Module({
  controllers: [TechniciansController],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}
