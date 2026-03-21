import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

interface AuthenticatedRequest {
  user: { userId: string; companyId: string; role: string };
}

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.technicianService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.technicianService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto, @Req() req: AuthenticatedRequest) {
    return this.technicianService.create(dto, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.technicianService.update(id, dto, req.user.companyId);
  }
}
