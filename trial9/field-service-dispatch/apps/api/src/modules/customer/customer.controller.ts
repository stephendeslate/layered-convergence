import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompanyId } from '../../common/decorators/company.decorator';

@Controller('customers')
@UseGuards(CompanyGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@CurrentCompanyId() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customerService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentCompanyId() companyId: string) {
    return this.customerService.findAllByCompany(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customerService.delete(id);
  }
}
