import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';

@Controller('schedules')
@UseGuards(CompanyGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('technician/:technicianId')
  getTechnicianSchedule(
    @CompanyId() companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getTechnicianSchedule(companyId, technicianId, date);
  }

  @Get('daily')
  getDailySchedule(
    @CompanyId() companyId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getDailySchedule(companyId, date);
  }
}
