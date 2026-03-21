import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto, UpdateAvailabilityDto } from './dto/technician.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('technicians')
@UseGuards(AuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.technicianService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.technicianService.findById(req.companyId!, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(req.companyId!, id, dto);
  }

  @Patch(':id/availability')
  updateAvailability(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.technicianService.updateAvailability(req.companyId!, id, dto.availability);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.technicianService.remove(req.companyId!, id);
  }
}
