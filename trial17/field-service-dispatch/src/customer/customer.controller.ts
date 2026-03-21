import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    return this.customerService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.customerService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.customerService.findOne(req.companyId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(req.companyId, id, dto);
  }
}
