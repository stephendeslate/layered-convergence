import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

@Controller('gps-events')
@UseGuards(JwtAuthGuard)
export class GpsEventController {
  constructor(private readonly gpsEventService: GpsEventService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.gpsEventService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.gpsEventService.findOne(id, user.companyId);
  }

  @Post()
  create(@Body() dto: CreateGpsEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.gpsEventService.create({ ...dto, companyId: user.companyId });
  }
}
