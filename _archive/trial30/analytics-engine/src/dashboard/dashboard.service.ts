import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        ...(dto.layout !== undefined && { layout: dto.layout as any }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async findAll(tenantId?: string) {
    return this.prisma.dashboard.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { widgets: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id },
      include: { widgets: true, embedConfig: true },
    });
  }

  async findByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.layout !== undefined && { layout: dto.layout as any }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string) {
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}
