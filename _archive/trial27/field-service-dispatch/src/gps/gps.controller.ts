import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { GpsService } from './gps.service';

@Controller('gps')
@UseGuards(CompanyContextGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('locations')
  getLocations(@CompanyId() companyId: string) {
    return this.gpsService.getLocations(companyId);
  }

  @Get('locations/:technicianId')
  getTechnicianLocation(
    @CompanyId() companyId: string,
    @Param('technicianId') technicianId: string,
  ) {
    return this.gpsService.getTechnicianLocation(companyId, technicianId);
  }
}
