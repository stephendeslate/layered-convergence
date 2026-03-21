import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('routes')
@UseGuards(AuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateRouteDto) {
    return this.routeService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.routeService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.routeService.findOne(req.companyId, id);
  }
}
