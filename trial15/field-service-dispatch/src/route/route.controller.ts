import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AutoAssignDto } from './dto/auto-assign.dto';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Req() req: CompanyRequest, @Body() dto: CreateRouteDto) {
    return this.routeService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: CompanyRequest) {
    return this.routeService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.routeService.findOne(id, req.companyId);
  }

  @Put(':id')
  update(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routeService.update(id, req.companyId, dto);
  }

  @Delete(':id')
  remove(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.routeService.remove(id, req.companyId);
  }

  @Post('auto-assign')
  autoAssign(@Req() req: CompanyRequest, @Body() dto: AutoAssignDto) {
    return this.routeService.autoAssignNearest(dto.workOrderId, req.companyId);
  }
}
