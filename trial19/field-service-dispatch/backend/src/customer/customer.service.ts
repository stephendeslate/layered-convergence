import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto, companyId: string) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    await this.findById(id, companyId);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }
}
