import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { GpsHistoryService } from './gps-history.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('gps-history')
export class GpsHistoryController {
  constructor(private readonly gpsHistoryService: GpsHistoryService) {}

  @Get(':technicianId/recent')
  @Roles('ADMIN', 'DISPATCHER')
  async getRecent(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('hours') hours?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsHistoryService.getRecentPositions(
      companyId,
      technicianId,
      hours ? parseInt(hours, 10) : 8,
      limit ? parseInt(limit, 10) : 500,
    );
  }

  @Get(':technicianId/range')
  @Roles('ADMIN', 'DISPATCHER')
  async getRange(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsHistoryService.getPositionsBetween(
      companyId,
      technicianId,
      new Date(from),
      new Date(to),
      limit ? parseInt(limit, 10) : 1000,
    );
  }
}
