import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import {
  CompanyService,
  UpdateCompanyDto,
  CompanyBrandingDto,
  ServiceAreaDto,
} from './company.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  async get(@CurrentCompany() companyId: string) {
    return this.companyService.get(companyId);
  }

  @Patch()
  @Roles('ADMIN')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(companyId, dto, user.sub);
  }

  @Get('settings')
  @Roles('ADMIN', 'DISPATCHER')
  async getSettings(@CurrentCompany() companyId: string) {
    return this.companyService.getSettings(companyId);
  }

  @Patch('branding')
  @Roles('ADMIN')
  async updateBranding(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CompanyBrandingDto,
  ) {
    return this.companyService.updateBranding(companyId, dto, user.sub);
  }

  @Post('service-area')
  @Roles('ADMIN')
  async setServiceArea(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ServiceAreaDto,
  ) {
    return this.companyService.setServiceArea(companyId, dto, user.sub);
  }
}
