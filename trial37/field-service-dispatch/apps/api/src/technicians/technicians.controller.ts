// TRACED: FD-TECH-002 — Technicians REST controller with DTO classes
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';

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
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.techniciansService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      Number(pageSize) || 20,
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
}
