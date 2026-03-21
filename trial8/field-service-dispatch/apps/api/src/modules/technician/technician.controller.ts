import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('technicians')
@UseGuards(CompanyGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(
    @CurrentCompany() company: { id: string },
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.technicianService.create(company.id, dto);
  }

  @Get()
  findAll(@CurrentCompany() company: { id: string }) {
    return this.technicianService.findAllByCompany(company.id);
  }

  @Get('available')
  findAvailable(
    @CurrentCompany() company: { id: string },
    @Query('skills') skills?: string,
  ) {
    const requiredSkills = skills?.split(',').map((s) => s.trim());
    return this.technicianService.findAvailable(company.id, requiredSkills);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicianService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, dto);
  }

  @Put(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.technicianService.updatePosition(id, body.lat, body.lng);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicianService.remove(id);
  }
}
