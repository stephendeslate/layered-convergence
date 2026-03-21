import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TechnicianService } from './technician.service';

@UseGuards(AuthGuard('jwt'))
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.technicianService.findAll(req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { name: string; specialization: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.technicianService.create(body.name, body.specialization, req.user.tenantId);
  }
}
