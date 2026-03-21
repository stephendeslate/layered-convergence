import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst justified: fetching single dashboard by unique ID
    return this.prisma.dashboard.findFirst({
      where: { id },
      include: { widgets: true },
    });
  }

  async create(data: { title: string; tenantId: string; userId: string }) {
    return this.prisma.dashboard.create({ data });
  }
}
