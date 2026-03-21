import { Controller, Get, Post, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { GpsService } from './gps.service';
import { CreateGpsEventDto } from './dto/gps.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('gps')
@UseGuards(AuthGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('events')
  recordEvent(@Req() req: Request, @Body() dto: CreateGpsEventDto) {
    return this.gpsService.recordEvent(req.companyId!, dto);
  }

  @Get('technicians/:technicianId/events')
  findByTechnician(
    @Req() req: Request,
    @Param('technicianId') technicianId: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsService.findByTechnician(
      req.companyId!,
      technicianId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('locations')
  getLatestLocations(@Req() req: Request) {
    return this.gpsService.getLatestLocations(req.companyId!);
  }
}
