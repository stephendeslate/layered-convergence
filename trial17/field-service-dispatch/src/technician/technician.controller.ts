import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('technicians')
@UseGuards(AuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.technicianService.findAll(req.companyId);
  }

  @Get('available')
  findAvailable(@Req() req: any) {
    return this.technicianService.findAvailable(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.technicianService.findOne(req.companyId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(req.companyId, id, dto);
  }
}
