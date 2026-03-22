import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  paginate,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  sanitizeInput,
} from '@analytics-engine/shared';

// TRACED: AE-API-003
@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const take = Math.min(pageSize, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, take);
  }

  async findOne(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      // findFirst: filtering by both id and tenantId for RLS enforcement at app level
      where: { id, tenantId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  // TRACED: AE-DB-002
  async create(
    tenantId: string,
    createdById: string,
    data: { name: string; description?: string; config?: Record<string, unknown> },
  ) {
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedDescription = data.description
      ? sanitizeInput(data.description)
      : null;

    return this.prisma.dashboard.create({
      data: {
        tenantId,
        createdById,
        name: sanitizedName,
        description: sanitizedDescription,
        config: data.config ?? {},
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: { name?: string; description?: string; config?: Record<string, unknown> },
  ) {
    await this.findOne(id, tenantId);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = sanitizeInput(data.name);
    if (data.description !== undefined)
      updateData.description = sanitizeInput(data.description);
    if (data.config !== undefined) updateData.config = data.config;

    return this.prisma.dashboard.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
