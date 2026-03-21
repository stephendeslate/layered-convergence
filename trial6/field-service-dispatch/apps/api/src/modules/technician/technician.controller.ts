import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianLocationDto } from './dto/create-technician.dto';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(dto);
  }

  @Get()
  findByCompany(@Query('companyId') companyId: string) {
    return this.technicianService.findByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicianService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, dto);
  }

  @Put(':id/location')
  updateLocation(@Param('id') id: string, @Body() dto: TechnicianLocationDto) {
    return this.technicianService.updateLocation(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicianService.remove(id);
  }
}
