// TRACED: FD-TECH-002 — Technicians REST controller
import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string; tenantId: string } },
    @Body() body: { name: string; latitude: string; longitude: string },
  ) {
    return this.techniciansService.create(req.user.tenantId, body);
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
}
