// [TRACED:API-010] Route CRUD and transition endpoints with company scope

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateRouteDto } from './dto/create-route.dto';
import { TransitionRouteDto } from './dto/transition-route.dto';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.routeService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.routeService.findOne(id, user.companyId);
  }

  @Post()
  create(
    @Body() dto: CreateRouteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeService.create({
      ...dto,
      date: new Date(dto.date),
      companyId: user.companyId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRouteDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeService.update(id, user.companyId, dto);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionRouteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeService.transition(id, user.companyId, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.routeService.remove(id, user.companyId);
  }
}
