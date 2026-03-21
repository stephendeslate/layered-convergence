import { Controller, Get, Post, Put, Param, Body, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.customerService.findAll(req.companyId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.customerService.findById(id, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto, @Req() req: AuthenticatedRequest) {
    return this.customerService.create(dto, req.companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.customerService.update(id, dto, req.companyId);
  }
}
