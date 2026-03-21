import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string; companyId: string } }) {
    return this.technicianService.findAll(req.user.id, req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.technicianService.findOne(
      id,
      req.user.id,
      req.user.companyId,
    );
  }

  @Post()
  async create(
    @Body() body: { name: string; email: string; phone?: string; skills: string[] },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.technicianService.create(body, req.user.id, req.user.companyId);
  }
}
