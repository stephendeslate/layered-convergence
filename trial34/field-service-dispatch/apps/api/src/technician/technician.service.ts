import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { slugify } from '@field-service-dispatch/shared';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.technician.findMany({
      where: { tenantId },
      include: { workOrders: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { name: 'asc' },
    });
  }

  // TRACED: FD-CQ-SLUG-003 — slugify used for technician slug generation
  async create(name: string, specialization: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const slug = slugify(name);
    return this.prisma.technician.create({
      data: { name, slug, specialization, tenantId },
    });
  }
}
