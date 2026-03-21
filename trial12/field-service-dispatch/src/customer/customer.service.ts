import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, companyId },
    });
  }

  findAll(companyId: string) {
    return this.prisma.customer.findMany({ where: { companyId } });
  }

  findOne(companyId: string, id: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
    });
  }

  update(companyId: string, id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.updateMany({
      where: { id, companyId },
      data: dto,
    }).then(() => this.prisma.customer.findUniqueOrThrow({ where: { id } }));
  }

  remove(companyId: string, id: string) {
    return this.prisma.customer.deleteMany({ where: { id, companyId } });
  }
}
