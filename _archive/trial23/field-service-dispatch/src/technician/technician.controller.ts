import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TechnicianService } from './technician.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto } from './dto/update-technician.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.technicianService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.technicianService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
    @Req() req: Request,
  ) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.technicianService.update(id, companyId, dto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
    @Req() req: Request,
  ) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.technicianService.updatePosition(id, companyId, dto.lat, dto.lng);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.technicianService.remove(id, companyId);
  }
}
