import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GpsService } from './gps.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';

@Controller('gps')
@UseGuards(JwtAuthGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('positions')
  getLatestPositions(@CompanyId() companyId: string) {
    return this.gpsService.getLatestPositions(companyId);
  }

  @Get('history/:technicianId')
  getHistory(
    @Param('technicianId') technicianId: string,
    @Query('since') since?: string,
  ) {
    return this.gpsService.getHistory(
      technicianId,
      since ? new Date(since) : undefined,
    );
  }
}
