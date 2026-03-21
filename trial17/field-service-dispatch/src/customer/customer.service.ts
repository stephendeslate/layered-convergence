import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { workOrders: true },
    });

    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: dto,
    });
  }
}
