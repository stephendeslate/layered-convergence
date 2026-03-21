import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Req() req: CompanyRequest, @Body() dto: CreateCustomerDto) {
    return this.customerService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: CompanyRequest) {
    return this.customerService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.customerService.findOne(id, req.companyId);
  }

  @Put(':id')
  update(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, req.companyId, dto);
  }

  @Delete(':id')
  remove(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.customerService.remove(id, req.companyId);
  }
}
