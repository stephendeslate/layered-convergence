import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';

interface AuthenticatedRequest {
  user: { userId: string; companyId: string; role: string };
}

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.routeService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.routeService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateRouteDto, @Req() req: AuthenticatedRequest) {
    return this.routeService.create(dto, req.user.companyId);
  }
}
