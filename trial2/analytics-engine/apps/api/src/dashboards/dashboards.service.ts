import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll(tenantId: string, cursor?: string, limit: number = 20) {
    const take = Math.min(limit, 100);
    const dashboards = await this.prisma.dashboard.findMany({
      where: { tenantId },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { widgets: true } } },
    });

    const hasMore = dashboards.length > take;
    const data = hasMore ? dashboards.slice(0, take) : dashboards;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        isPublished: d.isPublished,
        widgetCount: d._count.widgets,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
      nextCursor,
      hasMore,
    };
  }

  async findOne(tenantId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    const existing = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
        ...(dto.layout !== undefined ? { layout: dto.layout as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Dashboard not found');
    }

    await this.prisma.dashboard.delete({ where: { id } });
  }
}
