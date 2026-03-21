import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    this.logger.log(`Creating customer: ${dto.name} for company ${companyId}`);
    return this.prisma.customer.create({
      data: { ...dto, companyId },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: { id },
      include: { workOrders: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
