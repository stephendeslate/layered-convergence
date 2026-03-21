import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto, OptimizeRouteDto } from './route.dto';
import { CompanyGuard } from '../../common/guards/company.guard';

@Controller('routes')
@UseGuards(CompanyGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Get('technician/:technicianId')
  findByTechnicianAndDate(
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
  ) {
    return this.routeService.findByTechnicianAndDate(technicianId, date);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.routeService.findById(id);
  }

  @Post('optimize')
  optimize(@Body() dto: OptimizeRouteDto) {
    return this.routeService.optimize(dto.technicianId, dto.date);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.routeService.delete(id);
  }
}
