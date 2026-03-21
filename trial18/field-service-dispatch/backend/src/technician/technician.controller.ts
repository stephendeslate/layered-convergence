import { Controller, Get, Post, Put, Param, Body, Req } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.technicianService.findAll(req.companyId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.technicianService.findById(id, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateTechnicianDto, @Req() req: AuthenticatedRequest) {
    return this.technicianService.create(dto, req.companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.technicianService.update(id, dto, req.companyId);
  }
}
