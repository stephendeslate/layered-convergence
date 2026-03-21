import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateRouteDto) {
    return this.routesService.create(user.companyId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.routesService.findAll(user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.routesService.findById(id, user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get('technician/:technicianId')
  findByTechnician(
    @Param('technicianId', ParseUUIDPipe) technicianId: string,
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
  ) {
    return this.routesService.findByTechnicianAndDate(technicianId, user.companyId, date);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post(':id/optimize')
  optimize(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.routesService.optimize(id, user.companyId);
  }
}
