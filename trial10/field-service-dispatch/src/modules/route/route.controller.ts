import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto, OptimizeRouteDto } from './dto/create-route.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('routes')
@UseGuards(CompanyGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(
    @CurrentCompany() company: { id: string },
    @Body() dto: CreateRouteDto,
  ) {
    return this.routeService.create(company.id, dto);
  }

  @Post('optimize')
  optimize(
    @CurrentCompany() company: { id: string },
    @Body() dto: OptimizeRouteDto,
  ) {
    return this.routeService.optimize(company.id, dto.technicianId, dto.date);
  }

  @Get('technician/:technicianId')
  findByTechnician(
    @Param('technicianId') technicianId: string,
    @Query('date') date?: string,
  ) {
    return this.routeService.findByTechnician(technicianId, date);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routeService.remove(id);
  }
}
