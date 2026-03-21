import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll(@Query('technicianId') technicianId?: string) {
    if (technicianId) {
      return this.scheduleService.findByTechnician(technicianId);
    }
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      technicianId: string;
    },
  ) {
    return this.scheduleService.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }
}
