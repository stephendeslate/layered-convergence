import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: string; companyId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('gps-events')
export class GpsEventController {
  constructor(private readonly gpsEventService: GpsEventService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.gpsEventService.findAll(req.user.companyId);
  }

  @Get('technician/:technicianId')
  findByTechnician(
    @Param('technicianId') technicianId: string,
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
