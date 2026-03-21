import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { GpsService } from './gps.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('gps')
@UseGuards(AuthGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post()
  record(@Req() req: any, @Body() dto: CreateGpsEventDto) {
    return this.gpsService.record(req.companyId, dto);
  }

  @Get('technician/:technicianId')
  findByTechnician(
    @Req() req: any,
    @Param('technicianId') technicianId: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsService.findByTechnician(
      req.companyId,
      technicianId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('positions')
  getLatestPositions(@Req() req: any) {
    return this.gpsService.getLatestPositions(req.companyId);
  }
}
