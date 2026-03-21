import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.customerService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customerService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: { name: string; email: string; phone: string; address: string }, @Request() req: AuthenticatedRequest) {
    return this.customerService.create({ ...body, companyId: req.user.companyId });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customerService.remove(id, req.user.companyId);
  }
}
