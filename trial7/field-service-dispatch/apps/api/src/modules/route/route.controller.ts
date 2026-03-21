import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { CompanyGuard } from '../../common/guards/company.guard';

@Controller('routes')
@UseGuards(CompanyGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Get()
  findByTechnician(@Query('technicianId') technicianId: string) {
    return this.routeService.findByTechnician(technicianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeService.findOneOrThrow(id);
  }

  @Post(':id/optimize')
  optimize(@Param('id') id: string) {
    return this.routeService.optimize(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routeService.remove(id);
  }
}
