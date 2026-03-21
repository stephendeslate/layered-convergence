import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async create(
    @CurrentCompany() companyId: string,
    @Body()
    body: {
      technicianId: string;
      date: string;
      workOrderIds: string[];
    },
  ) {
    return this.routeService.create(
      companyId,
      body.technicianId,
      body.date,
      body.workOrderIds,
    );
  }

  @Get(':id')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.routeService.get(companyId, id);
  }

  @Post(':id/optimize')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async optimize(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.routeService.optimize(companyId, id);
  }

  @Get(':id/directions')
  async directions(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.routeService.getDirections(companyId, id);
  }

  @Get(':id/eta/:stopIndex')
  async eta(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Param('stopIndex') stopIndex: string,
  ) {
    return this.routeService.getEta(companyId, id, parseInt(stopIndex, 10));
  }

  @Get('technician/:technicianId/date/:date')
  async getByTechnicianAndDate(
    @CurrentCompany() companyId: string,
    @Param('technicianId') technicianId: string,
    @Param('date') date: string,
  ) {
    return this.routeService.getByTechnicianAndDate(companyId, technicianId, date);
  }
}
