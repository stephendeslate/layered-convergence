import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto, UpdateLocationDto } from './technician.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompanyId } from '../../common/decorators/company.decorator';

@Controller('technicians')
@UseGuards(CompanyGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@CurrentCompanyId() companyId: string, @Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentCompanyId() companyId: string) {
    return this.technicianService.findAllByCompany(companyId);
  }

  @Get('available')
  findAvailable(@CurrentCompanyId() companyId: string) {
    return this.technicianService.findAvailable(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.technicianService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, dto);
  }

  @Patch(':id/location')
  updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.technicianService.updateLocation(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.technicianService.delete(id);
  }
}
