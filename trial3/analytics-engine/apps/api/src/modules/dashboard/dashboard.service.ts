import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; layout?: Record<string, unknown> }) {
    // Verify tenant exists
    await this.prisma.tenant.findFirstOrThrow({ where: { id: tenantId } });
    return this.prisma.dashboard.create({
      data: { ...data, tenantId },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async findByIdAndTenant(id: string, tenantId: string) {
    return this.prisma.dashboard.findFirstOrThrow({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(id: string, tenantId: string, data: { name?: string; layout?: Record<string, unknown> }) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string, tenantId: string, isPublished: boolean) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished },
    });
  }
}
