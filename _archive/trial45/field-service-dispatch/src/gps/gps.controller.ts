import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsPositionDto } from './dto/gps-position.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';

@Controller('gps')
@UseGuards(JwtAuthGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('position')
  recordPosition(@CompanyId() companyId: string, @Body() dto: GpsPositionDto) {
    return this.gpsService.recordPosition(companyId, dto);
  }

  @Get('history/:technicianId')
  getHistory(
    @CompanyId() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsService.getHistory(
      companyId,
      technicianId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('positions')
  getLatestPositions(@CompanyId() companyId: string) {
    return this.gpsService.getLatestPositions(companyId);
  }
}
