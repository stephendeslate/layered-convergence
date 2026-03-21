import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { companyId, ...dto },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });
  }

  async findOneOrThrow(companyId: string, id: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
      include: { workOrders: true },
    });
  }

  async update(companyId: string, id: string, dto: Partial<CreateCustomerDto>) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.delete({ where: { id } });
  }
}
