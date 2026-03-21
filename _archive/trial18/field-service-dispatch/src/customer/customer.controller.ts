import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.customerService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.customerService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: Request,
  ) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.customerService.update(id, companyId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.customerService.remove(id, companyId);
  }
}
