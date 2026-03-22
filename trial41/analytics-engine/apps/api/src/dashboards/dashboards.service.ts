// TRACED:AE-DASHBOARDS-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, ownerId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        tenantId,
        ownerId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        tenantId: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          tenantId: true,
          ownerId: true,
          owner: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justified: fetching by ID scoped to tenant for authorization
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        config: true,
        isPublic: true,
        tenantId: true,
        ownerId: true,
        owner: { select: { id: true, name: true, email: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        tenantId: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.dashboard.delete({ where: { id } });
    return { deleted: true };
  }
}
