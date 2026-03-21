import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto, UpdateTechnicianLocationDto } from './dto/update-technician.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('technicians')
export class TechniciansController {
  constructor(private techniciansService: TechniciansService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(user.companyId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.techniciansService.findAll(user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get('available')
  findAvailable(@CurrentUser() user: JwtPayload) {
    return this.techniciansService.findAvailable(user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get('nearest')
  findNearest(
    @CurrentUser() user: JwtPayload,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('skills') skills?: string,
    @Query('radiusMeters') radiusMeters?: number,
  ) {
    const skillArray = skills ? skills.split(',') : undefined;
    return this.techniciansService.findNearest(user.companyId, lat, lng, skillArray, radiusMeters);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.techniciansService.findByIdAndCompany(id, user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.techniciansService.update(id, user.companyId, dto);
  }

  @Roles(UserRole.TECHNICIAN)
  @Patch(':id/location')
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianLocationDto,
  ) {
    return this.techniciansService.updateLocation(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get(':id/work-orders')
  getWorkOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.techniciansService.getWorkOrders(id, user.companyId);
  }
}
