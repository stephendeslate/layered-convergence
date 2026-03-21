import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateTechnicianDto } from './dto/create-technician.dto';

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.technicianService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.technicianService.findOne(id, user.companyId);
  }

  @Post()
  create(
    @Body() dto: CreateTechnicianDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.technicianService.create({
      ...dto,
      companyId: user.companyId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTechnicianDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.technicianService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.technicianService.remove(id, user.companyId);
  }
}
