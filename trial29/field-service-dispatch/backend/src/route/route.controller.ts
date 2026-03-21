import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(@Query('companyId') companyId: string) {
    return this.routeService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.routeService.findById(id);
  }

  @Post()
  async create(
    @Body() body: { name: string; date: string; technicianId: string; companyId: string },
  ) {
    return this.routeService.create({
      name: body.name,
      date: new Date(body.date),
      technicianId: body.technicianId,
      companyId: body.companyId,
    });
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.routeService.transitionStatus(id, status);
  }
}
