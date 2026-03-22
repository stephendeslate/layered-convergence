import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// TRACED: FD-SCHEDULE-CRUD
@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @Body() dto: CreateScheduleDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.scheduleService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.scheduleService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.scheduleService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.scheduleService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.scheduleService.remove(id, req.user.tenantId);
  }
}
