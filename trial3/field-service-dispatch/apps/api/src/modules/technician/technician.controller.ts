import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { TechnicianService } from './technician.service';

/**
 * [VERIFY:ROUTE_ORDERING] Static routes defined BEFORE parameterized routes.
 */
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(@Body() body: {
    companyId: string;
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
  }) {
    return this.technicianService.create(body.companyId, body);
  }

  @Get()
  async findAll(@Query('companyId') companyId: string) {
    return this.technicianService.findAllByCompany(companyId);
  }

  // STATIC ROUTE FIRST [VERIFY:ROUTE_ORDERING]
  @Get('available')
  async findAvailable(@Query('companyId') companyId: string) {
    return this.technicianService.findAvailable(companyId);
  }

  // PARAMETERIZED ROUTE AFTER STATIC
  @Get(':id')
  async findById(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.technicianService.findByIdAndCompany(id, companyId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() body: { name?: string; phone?: string; skills?: string[] },
  ) {
    return this.technicianService.update(id, companyId, body);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() body: { status: string },
  ) {
    return this.technicianService.updateStatus(id, companyId, body.status);
  }

  @Patch(':id/location')
  async updateLocation(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.technicianService.updateLocation(id, companyId, body.lat, body.lng);
  }
}
