import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('customers')
@UseGuards(CompanyGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(
    @CurrentCompany() company: { id: string },
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customerService.create(company.id, dto);
  }

  @Get()
  findAll(@CurrentCompany() company: { id: string }) {
    return this.customerService.findAllByCompany(company.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
