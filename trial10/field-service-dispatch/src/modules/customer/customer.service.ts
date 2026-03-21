import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, companyId },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { workOrders: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
  }

  async findOne(id: string, companyId: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: { id, companyId },
      include: { workOrders: true },
    });
  }

  async update(id: string, companyId: string, data: Partial<CreateCustomerDto>) {
    return this.prisma.customer.update({
      where: { id, companyId },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    return this.prisma.customer.delete({ where: { id, companyId } });
  }
}
