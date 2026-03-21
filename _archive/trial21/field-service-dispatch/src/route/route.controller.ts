import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';

@Controller()
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('routes')
  create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Get('technicians/:technicianId/routes')
  findByTechnician(@Param('technicianId') technicianId: string) {
    return this.routeService.findByTechnician(technicianId);
  }

  @Post('routes/:id/optimize')
  optimize(@Param('id') id: string) {
    return this.routeService.optimize(id);
  }
}
