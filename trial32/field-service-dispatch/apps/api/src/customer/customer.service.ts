// [TRACED:FD-AC-003] Customer CRUD with company isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; email: string; phone: string; address: string; companyId: string }) {
    return this.prisma.customer.create({ data });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: querying by id + companyId for company isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.customer.delete({ where: { id } });
  }
}
