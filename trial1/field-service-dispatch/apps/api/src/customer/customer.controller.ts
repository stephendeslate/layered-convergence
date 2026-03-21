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
import { CustomerService, CreateCustomerDto, CustomerListQuery } from './customer.service';
import { CurrentCompany, CurrentUser, Roles, Public } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customerService.create(companyId, dto, user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  async list(
    @CurrentCompany() companyId: string,
    @Query() query: CustomerListQuery,
  ) {
    return this.customerService.list(companyId, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.customerService.get(companyId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    return this.customerService.update(companyId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    await this.customerService.delete(companyId, id, user.sub);
    return { message: 'Customer deleted' };
  }
}

@Controller('portal')
export class PortalController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':token')
  @Public()
  async getPortalData(@Param('token') token: string) {
    return this.customerService.getPortalData(token);
  }
}
