import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('gps-events')
export class GpsEventController {
  constructor(private readonly gpsEventService: GpsEventService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.gpsEventService.findAll(req.companyId);
  }

  @Get('technician/:technicianId')
  async findByTechnician(
    @Param('technicianId') technicianId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gpsEventService.findByTechnician(technicianId, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateGpsEventDto, @Req() req: AuthenticatedRequest) {
    return this.gpsEventService.create(dto, req.companyId);
  }
}
