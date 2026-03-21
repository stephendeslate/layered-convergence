import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.technicianService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.technicianService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: { name: string; specialty: string }, @Request() req: AuthenticatedRequest) {
    return this.technicianService.create({ ...body, companyId: req.user.companyId });
  }

  @Patch(':id/availability')
  updateAvailability(@Param('id') id: string, @Body() body: { isAvailable: boolean }, @Request() req: AuthenticatedRequest) {
    return this.technicianService.updateAvailability(id, req.user.companyId, body.isAvailable);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.technicianService.remove(id, req.user.companyId);
  }
}
