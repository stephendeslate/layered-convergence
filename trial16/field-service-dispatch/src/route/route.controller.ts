import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('routes')
@UseGuards(AuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateRouteDto) {
    return this.routeService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.routeService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.routeService.findById(req.companyId!, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routeService.update(req.companyId!, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.routeService.remove(req.companyId!, id);
  }
}
