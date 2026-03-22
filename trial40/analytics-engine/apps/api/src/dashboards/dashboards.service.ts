// TRACED:AE-API-03 — Dashboards CRUD service with Prisma select/include
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams, paginate, PaginatedResult } from '@analytics-engine/shared';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto): Promise<Record<string, unknown>> {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        tenantId: dto.tenantId,
        userId: dto.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        tenantId: true,
        userId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const params = normalizePageParams(page, pageSize);
    const { skip, take } = paginate(params);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        select: {
          id: true,
          title: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
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

  async findOne(id: string): Promise<Record<string, unknown>> {
    // findFirst justified: lookup by primary key for detail endpoint
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id },
      include: {
        tenant: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto): Promise<Record<string, unknown>> {
    await this.findOne(id);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        tenantId: true,
        userId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.prisma.dashboard.delete({ where: { id } });
    return { deleted: true };
  }
}
