import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.routeService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.routeService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: { name: string; date: Date; technicianId: string }, @Request() req: AuthenticatedRequest) {
    return this.routeService.create({ ...body, companyId: req.user.companyId });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.routeService.remove(id, req.user.companyId);
  }
}
