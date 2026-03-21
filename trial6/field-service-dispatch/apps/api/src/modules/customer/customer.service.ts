import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async findByCompany(companyId: string) {
    return this.prisma.customer.findMany({ where: { companyId } });
  }

  async findOne(id: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id },
      include: { workOrders: true },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
