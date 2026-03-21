import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDashboardDto } from './dto/create-dashboard.dto.js';
import { UpdateDashboardDto } from './dto/update-dashboard.dto.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        // type assertion justified: layout DTO is Record<string, unknown>, Prisma expects InputJsonValue
        layout: (dto.layout ?? {}) as Prisma.InputJsonValue,
        isPublished: dto.isPublished,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id, tenantId },
      include: { widgets: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    const { layout, ...rest } = dto;
    return this.prisma.dashboard.update({
      where: { id, tenantId },
      data: {
        ...rest,
        // type assertion justified: layout DTO is Record<string, unknown>, Prisma expects InputJsonValue
        ...(layout !== undefined
          ? { layout: layout as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.dashboard.delete({
      where: { id, tenantId },
    });
  }
}
