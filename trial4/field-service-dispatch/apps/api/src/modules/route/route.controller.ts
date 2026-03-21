import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto, OptimizeRouteDto } from './route.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateRouteDto,
  ) {
    return this.routeService.create(companyId, dto);
  }

  // Static route before parameterized — per v3.0 Section 5.9
  @Post('optimize')
  async optimize(
    @Headers('x-company-id') companyId: string,
    @Body() dto: OptimizeRouteDto,
  ) {
    return this.routeService.optimize(companyId, dto);
  }

  @Get('technician/:technicianId')
  async findByTechnician(
    @Headers('x-company-id') companyId: string,
    @Param('technicianId') technicianId: string,
    @Query('date') date?: string,
  ) {
    return this.routeService.findByTechnician(companyId, technicianId, date);
  }

  @Get(':id')
  async findById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.routeService.findById(companyId, id);
  }
}
