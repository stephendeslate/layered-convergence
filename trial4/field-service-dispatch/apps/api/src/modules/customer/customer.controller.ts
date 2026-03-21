import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customerService.create(companyId, dto);
  }

  @Get()
  async findAll(@Headers('x-company-id') companyId: string) {
    return this.customerService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.customerService.findById(companyId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(companyId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.customerService.delete(companyId, id);
  }
}
