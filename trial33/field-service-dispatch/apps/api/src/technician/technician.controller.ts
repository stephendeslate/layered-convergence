import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TechnicianService } from './technician.service';
import type { AvailabilityStatus } from '@field-service-dispatch/shared';

// TRACED: FD-API-TECH-LIST-001 — Technician endpoints with JWT guard
@Controller('technicians')
@UseGuards(AuthGuard('jwt'))
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll() {
    return this.technicianService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.technicianService.findAvailable();
  }

  @Patch(':id/availability')
  updateAvailability(
    @Param('id') id: string,
    @Body() body: { availability: AvailabilityStatus },
  ) {
    return this.technicianService.updateAvailability(id, body.availability);
  }
}
