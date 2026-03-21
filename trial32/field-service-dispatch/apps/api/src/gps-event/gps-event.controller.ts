import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('gps-events')
@UseGuards(JwtAuthGuard)
export class GpsEventController {
  constructor(private readonly gpsEventService: GpsEventService) {}

  @Get('technician/:technicianId')
  findByTechnician(@Param('technicianId') technicianId: string, @Request() req: AuthenticatedRequest) {
    return this.gpsEventService.findByTechnician(technicianId, req.user.companyId);
  }

  @Post()
  create(@Body() body: { latitude: number; longitude: number; technicianId: string }, @Request() req: AuthenticatedRequest) {
    return this.gpsEventService.create({ ...body, companyId: req.user.companyId });
  }
}
