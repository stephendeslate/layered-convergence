import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: scoping by both id and companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto) {
    await this.findOne(id, companyId);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.customer.delete({ where: { id } });
  }
}
