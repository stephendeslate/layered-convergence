import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import express from 'express';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateCustomerDto) {
    return this.customerService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    return this.customerService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: express.Request, @Param('id') id: string) {
    return this.customerService.findOne(req.companyId!, id);
  }

  @Patch(':id')
  update(@Req() req: express.Request, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(req.companyId!, id, dto);
  }
}
