import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TechnicianService, CreateTechnicianDto, UpdateTechnicianDto, TechnicianListQuery } from './technician.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  @Roles('ADMIN')
  async create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.technicianService.create(companyId, dto, user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  async list(
    @CurrentCompany() companyId: string,
    @Query() query: TechnicianListQuery,
  ) {
    return this.technicianService.list(companyId, query);
  }

  @Get('nearby')
  @Roles('ADMIN', 'DISPATCHER')
  async nearby(
    @CurrentCompany() companyId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('skills') skills?: string,
  ) {
    return this.technicianService.getNearby(
      companyId,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 50,
      skills ? skills.split(',') : undefined,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.technicianService.get(companyId, id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicianService.update(companyId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    await this.technicianService.delete(companyId, id, user.sub);
    return { message: 'Technician deleted' };
  }

  @Get(':id/schedule')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async schedule(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    return this.technicianService.getSchedule(companyId, id, date);
  }
}
