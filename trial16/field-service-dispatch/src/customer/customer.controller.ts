import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Request } from 'express';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    return this.customerService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.customerService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.customerService.findById(req.companyId!, id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(req.companyId!, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.customerService.remove(req.companyId!, id);
  }
}
