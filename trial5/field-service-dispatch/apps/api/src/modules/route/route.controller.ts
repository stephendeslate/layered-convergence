import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { RouteService } from './route.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('optimize')
  optimizeRoute(@Body() dto: OptimizeRouteDto) {
    return this.routeService.optimizeRoute(dto);
  }

  @Get()
  findByTechnician(
    @Query('technicianId') technicianId: string,
    @Query('date') date?: string,
  ) {
    return this.routeService.findByTechnician(technicianId, date);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.routeService.findById(id);
  }
}
