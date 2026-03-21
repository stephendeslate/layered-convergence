import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateRouteDto } from './dto/create-route.dto';

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
  create(@Body() dto: CreateRouteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.routeService.create({ ...dto, companyId: user.companyId });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRouteDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.routeService.remove(id, user.companyId);
  }
}
