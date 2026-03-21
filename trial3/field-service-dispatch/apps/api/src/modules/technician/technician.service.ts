import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, data: {
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
  }) {
    return this.prisma.technician.create({
      data: { ...data, companyId },
    });
  }

  async findByIdAndCompany(id: string, companyId: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrders: {
          where: { status: { notIn: ['COMPLETED', 'INVOICED', 'PAID'] } },
          include: { customer: true },
        },
      },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  // Static route: /available — MUST be defined before /:id in controller [VERIFY:ROUTE_ORDERING]
  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, status: 'AVAILABLE' },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, companyId: string, data: {
    name?: string;
    phone?: string;
    skills?: string[];
  }) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({ where: { id }, data });
  }

  async updateStatus(id: string, companyId: string, status: string) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async updateLocation(id: string, companyId: string, lat: number, lng: number) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng, lastLocationAt: new Date() },
    });
  }
}
