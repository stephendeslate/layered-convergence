import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Req() req: CompanyRequest, @Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: CompanyRequest) {
    return this.technicianService.findAll(req.companyId);
  }

  @Get('available')
  findAvailable(@Req() req: CompanyRequest) {
    return this.technicianService.findAvailable(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.technicianService.findOne(id, req.companyId);
  }

  @Put(':id')
  update(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, req.companyId, dto);
  }

  @Put(':id/location')
  updateLocation(
    @Req() req: CompanyRequest,
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.technicianService.updateLocation(id, req.companyId, body.lat, body.lng);
  }

  @Delete(':id')
  remove(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.technicianService.remove(id, req.companyId);
  }
}
