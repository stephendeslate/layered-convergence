import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
    });
  }

  async findById(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findById(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findById(companyId, id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
