import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateLocationDto } from './dto/create-technician.dto';
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
  findAvailable(@CurrentCompany() company: { id: string }) {
    return this.technicianService.findAvailable(company.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.technicianService.findOne(id, company.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @Body() dto: Partial<CreateTechnicianDto>,
  ) {
    return this.technicianService.update(id, company.id, dto);
  }

  @Put(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.technicianService.updateLocation(id, dto);
  }

  @Put(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.technicianService.setStatus(id, status);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.technicianService.remove(id, company.id);
  }
}
