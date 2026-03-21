import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GpsTrackingService } from './gps-tracking.service';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('gps')
@UseGuards(CompanyGuard)
export class GpsTrackingController {
  constructor(private readonly gpsTrackingService: GpsTrackingService) {}

  @Get('positions')
  getAllPositions(@CurrentCompany() company: { id: string }) {
    return this.gpsTrackingService.getAllPositions(company.id);
  }

  @Get('eta/:technicianId')
  getEta(
    @Param('technicianId') technicianId: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string,
  ) {
    return this.gpsTrackingService.getEta(
      technicianId,
      parseFloat(destLat),
      parseFloat(destLng),
    );
  }
}
