// [TRACED:API-008] Technician CRUD with company scope

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { user: true },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope for multi-tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { user: true, workOrders: true, routes: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    userId?: string;
    companyId: string;
  }) {
    return this.prisma.technician.create({ data });
  }

  async update(
    id: string,
    companyId: string,
    data: { name?: string; email?: string; phone?: string; specialization?: string },
  ) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.technician.delete({
      where: { id },
    });
  }
}
