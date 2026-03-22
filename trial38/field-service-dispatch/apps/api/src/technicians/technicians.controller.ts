// TRACED: FD-TECH-002 — Technicians REST controller with full CRUD
// TRACED: FD-PERF-006 — Pagination clamping via clampPageSize on technicians list
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query, Header } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { clampPageSize, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string; tenantId: string } },
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.techniciansService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const clampedPageSize = clampPageSize(Number(pageSize) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    return this.techniciansService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      clampedPageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.techniciansService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.techniciansService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.techniciansService.remove(req.user.tenantId, id);
  }
}
