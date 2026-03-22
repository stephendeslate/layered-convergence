// TRACED: AE-API-05
// TRACED: AE-API-07
// TRACED: AE-SEC-08
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { slugify, sanitizeInput } from '@analytics-engine/shared';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDashboardDto) {
    const sanitizedTitle = sanitizeInput(dto.title);
    const slug = slugify(sanitizedTitle);

    return this.prisma.dashboard.create({
      data: {
        title: sanitizedTitle,
        slug,
        description: dto.description ? sanitizeInput(dto.description) : null,
        tenantId,
        createdBy: userId,
      },
    });
  }

  async findAll(tenantId: string) {
    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({
        where: { tenantId },
      }),
    ]);

    return { items, total };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for tenant isolation (not just unique id)
    return this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    const data: Record<string, string | null> = {};

    if (dto.title !== undefined) {
      data.title = sanitizeInput(dto.title);
      data.slug = slugify(data.title);
    }

    if (dto.description !== undefined) {
      data.description = sanitizeInput(dto.description);
    }

    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({
      where: { id },
    });
  }
}
