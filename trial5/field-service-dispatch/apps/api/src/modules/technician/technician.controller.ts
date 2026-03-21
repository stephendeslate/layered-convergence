import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(dto);
  }

  @Get()
  findAllByCompany(@Query('companyId') companyId: string) {
    return this.technicianService.findAllByCompany(companyId);
  }

  @Get('available')
  findAvailable(
    @Query('companyId') companyId: string,
    @Query('skills') skills?: string,
  ) {
    const requiredSkills = skills ? skills.split(',') : undefined;
    return this.technicianService.findAvailable(companyId, requiredSkills);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.technicianService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, dto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.technicianService.updatePosition(id, body.lat, body.lng);
  }
}
