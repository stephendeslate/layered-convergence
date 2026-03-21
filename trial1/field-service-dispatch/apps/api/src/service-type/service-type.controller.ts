import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { ServiceTypeService, UpdateServiceTypeDto } from './service-type.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('service-types')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async list(@CurrentCompany() companyId: string) {
    return this.serviceTypeService.list(companyId);
  }

  @Get('by-category')
  @Roles('ADMIN', 'DISPATCHER')
  async listByCategory(@CurrentCompany() companyId: string) {
    return this.serviceTypeService.listByCategory(companyId);
  }

  @Get(':code')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async get(
    @CurrentCompany() companyId: string,
    @Param('code') code: string,
  ) {
    return this.serviceTypeService.get(companyId, code);
  }

  @Get(':code/skills')
  @Roles('ADMIN', 'DISPATCHER')
  async getSkills(
    @CurrentCompany() companyId: string,
    @Param('code') code: string,
  ) {
    const skills = await this.serviceTypeService.getRequiredSkills(companyId, code);
    return { code, requiredSkills: skills };
  }

  @Patch(':code')
  @Roles('ADMIN')
  async update(
    @CurrentCompany() companyId: string,
    @Param('code') code: string,
    @Body() dto: UpdateServiceTypeDto,
  ) {
    return this.serviceTypeService.update(companyId, code, dto);
  }
}
