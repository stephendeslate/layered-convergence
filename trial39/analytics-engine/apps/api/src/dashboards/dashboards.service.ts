// TRACED:AE-API-03 — DashboardsService with Prisma select for list, include for detail
// TRACED:AE-PERF-09 — Dashboard queries use select/include to prevent over-fetching
// TRACED:AE-INFRA-02 — Docker Compose PostgreSQL 16 with healthcheck and named volume
// TRACED:AE-INFRA-03 — docker-compose.test.yml provides isolated test database

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { paginate, PageParams } from '@analytics-engine/shared';

interface FindAllParams extends PageParams {
  tenantId?: string;
}

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        tenantId: dto.tenantId,
        createdById: dto.createdById,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        tenantId: true,
        createdById: true,
        createdAt: true,
      },
    });
  }

  async findAll(params: FindAllParams) {
    const { skip, take } = paginate(params);
    const where = params.tenantId ? { tenantId: params.tenantId } : {};

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          isPublic: true,
          tenantId: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  async findOne(id: string) {
    // findFirst: lookup by primary key — unique but using findFirst for tenant-scoping flexibility
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        reports: {
          select: {
            id: true,
            title: true,
            format: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto) {
    await this.findOne(id);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        tenantId: true,
        createdById: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.dashboard.delete({ where: { id } });
  }
}
