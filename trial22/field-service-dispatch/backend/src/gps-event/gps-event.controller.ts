import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

interface AuthenticatedRequest {
  user: { userId: string; companyId: string; role: string };
}

@Controller('gps-events')
export class GpsEventController {
  constructor(private readonly gpsEventService: GpsEventService) {}

  @Get()
  findByTechnician(
    @Query('technicianId') technicianId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gpsEventService.findByTechnician(
      technicianId,
      req.user.companyId,
    );
  }

  @Post()
  create(@Body() dto: CreateGpsEventDto, @Req() req: AuthenticatedRequest) {
    return this.gpsEventService.create(dto, req.user.companyId);
  }
}
