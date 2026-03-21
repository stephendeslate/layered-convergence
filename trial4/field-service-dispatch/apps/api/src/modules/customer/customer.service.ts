import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
      include: { workOrders: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async delete(companyId: string, id: string) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.delete({ where: { id } });
  }
}
