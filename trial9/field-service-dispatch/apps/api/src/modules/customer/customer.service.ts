import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: { ...dto, companyId },
    });
    this.logger.log(`Customer created: ${customer.id} for company ${companyId}`);
    return customer;
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
      include: { workOrders: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
