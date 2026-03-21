import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RouteService } from './route.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('optimize')
  optimize(@Body() dto: OptimizeRouteDto) {
    return this.routeService.optimizeRoute(dto);
  }

  @Get(':technicianId')
  getRoute(
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
  ) {
    return this.routeService.getRoute(technicianId, date);
  }
}
