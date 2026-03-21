import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ScheduleService, SetScheduleDto } from './schedule.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('availability')
  @Roles('ADMIN', 'DISPATCHER')
  async setAvailability(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: SetScheduleDto,
  ) {
    return this.scheduleService.setAvailability(companyId, dto, user.sub);
  }

  @Get('availability/:technicianId')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async getAvailability(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
  ) {
    return this.scheduleService.getAvailability(companyId, technicianId);
  }

  @Get('daily/:technicianId')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async getDailySchedule(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getDailySchedule(companyId, technicianId, date);
  }

  @Get('weekly/:technicianId')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async getWeeklySchedule(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('weekStart') weekStart: string,
  ) {
    return this.scheduleService.getWeeklySchedule(companyId, technicianId, weekStart);
  }

  @Get('conflicts/:technicianId')
  @Roles('ADMIN', 'DISPATCHER')
  async detectConflicts(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.detectConflicts(companyId, technicianId, date);
  }
}
