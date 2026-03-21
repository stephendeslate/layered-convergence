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
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Controller('routes')
@UseGuards(CompanyContextGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateRouteDto) {
    return this.routesService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.routesService.findAll(companyId, technicianId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.routesService.findOne(companyId, id);
  }

  @Delete(':id')
  delete(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.routesService.delete(companyId, id);
  }
}
