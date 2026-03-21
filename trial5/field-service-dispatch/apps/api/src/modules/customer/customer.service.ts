import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: { id },
      include: { workOrders: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.prisma.customer.findUniqueOrThrow({ where: { id } });
    return this.prisma.customer.update({ where: { id }, data: dto });
  }
}
