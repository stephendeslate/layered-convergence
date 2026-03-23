import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboards.dto';
import { clampPageSize, calculateSkip } from '@analytics-engine/shared';

// TRACED:AE-API-002
@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, userId: string) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config ?? {},
        isPublic: dto.isPublic ?? false,
        tenantId: dto.tenantId,
        userId,
      },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const size = clampPageSize(pageSize);
    const skip = calculateSkip(page, size);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip,
        take: size,
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { data, total, page: page ?? 1, pageSize: size };
  }

  async findOne(id: string) {
    // findFirst: need to include relations and filter by id
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto) {
    await this.findOne(id);
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
