import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto, UpdateLocationDto } from './technician.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.technicianService.create(companyId, dto);
  }

  // Static route before parameterized — per v3.0 Section 5.9
  @Get('available')
  async findAvailable(
    @Headers('x-company-id') companyId: string,
    @Query('skills') skills?: string,
  ) {
    const skillList = skills ? skills.split(',') : undefined;
    return this.technicianService.findAvailable(companyId, skillList);
  }

  @Get()
  async findAll(@Headers('x-company-id') companyId: string) {
    return this.technicianService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.technicianService.findById(companyId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicianService.update(companyId, id, dto);
  }

  @Post(':id/location')
  async updateLocation(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.technicianService.updateLocation(companyId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.technicianService.delete(companyId, id);
  }
}
