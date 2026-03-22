// TRACED: FD-SCHED-004 — Schedules REST controller with full CRUD
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Header,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  async create(
    @Request() req: { user: { tenantId: string } },
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params = normalizePageParams(
      Number(page) || 1,
      Number(pageSize) || DEFAULT_PAGE_SIZE,
    );
    return this.schedulesService.findAll(
      req.user.tenantId,
      params.page,
      params.pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.schedulesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.schedulesService.remove(req.user.tenantId, id);
  }
}
