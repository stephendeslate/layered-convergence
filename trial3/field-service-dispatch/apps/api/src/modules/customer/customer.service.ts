import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, data: {
    name: string;
    email?: string;
    phone?: string;
    address: string;
    lat: number;
    lng: number;
  }) {
    return this.prisma.customer.create({
      data: { ...data, companyId },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdAndCompany(id: string, companyId: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, companyId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    lat?: number;
    lng?: number;
  }) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string, companyId: string) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.customer.delete({ where: { id } });
  }
}
