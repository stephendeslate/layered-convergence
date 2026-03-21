import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.routeService.findAll(req.companyId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.routeService.findById(id, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateRouteDto, @Req() req: AuthenticatedRequest) {
    return this.routeService.create(dto, req.companyId);
  }
}
