import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GpsService } from './gps.service';
import { UpdateGpsPositionDto } from './gps.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  // Static routes before parameterized — per v3.0 Section 5.9
  @Get('positions')
  async getAllPositions(@Headers('x-company-id') companyId: string) {
    return this.gpsService.getAllPositions(companyId);
  }

  @Get('eta/:workOrderId')
  async getEta(
    @Headers('x-company-id') companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.gpsService.getEta(companyId, workOrderId);
  }

  @Post(':technicianId')
  async updatePosition(
    @Headers('x-company-id') companyId: string,
    @Param('technicianId') technicianId: string,
    @Body() dto: UpdateGpsPositionDto,
  ) {
    return this.gpsService.updatePosition(companyId, technicianId, dto);
  }
}
