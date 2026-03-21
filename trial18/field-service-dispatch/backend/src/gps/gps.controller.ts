import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { GpsService } from './gps.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('gps-events')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('technician/:technicianId')
  async findByTechnician(
    @Param('technicianId') technicianId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gpsService.findByTechnician(technicianId, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateGpsEventDto, @Req() req: AuthenticatedRequest) {
    return this.gpsService.create(dto, req.companyId);
  }
}
