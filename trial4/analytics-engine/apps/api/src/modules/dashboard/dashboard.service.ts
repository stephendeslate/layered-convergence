import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        layout: dto.layout ?? {},
        isPublished: dto.isPublished ?? false,
      },
      include: { widgets: true },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.dashboard.findFirstOrThrow({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
      include: { widgets: true },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(tenantId: string, id: string) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: true },
    });
  }
}
