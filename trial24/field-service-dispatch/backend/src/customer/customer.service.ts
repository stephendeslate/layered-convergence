// [TRACED:API-007] Customer CRUD with company scope

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope for multi-tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: { workOrders: true, invoices: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    companyId: string;
  }) {
    return this.prisma.customer.create({ data });
  }

  async update(
    id: string,
    companyId: string,
    data: { name?: string; email?: string; phone?: string; address?: string },
  ) {
    await this.findOne(id, companyId);
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
