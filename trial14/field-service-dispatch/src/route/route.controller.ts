import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Get('technician/:technicianId')
  findByTechnician(@Param('technicianId') technicianId: string) {
    return this.routeService.findByTechnician(technicianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeService.findOne(id);
  }
}
