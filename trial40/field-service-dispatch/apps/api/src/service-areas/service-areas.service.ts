// TRACED: FD-SA-003 — Service areas service with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { paginate, sanitizeInput } from '@field-service-dispatch/shared';

@Injectable()
export class ServiceAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateServiceAreaDto) {
    const sanitizedName = sanitizeInput(dto.name);

    return this.prisma.serviceArea.create({
      data: {
        name: sanitizedName,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.serviceArea.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceArea.count({ where: { tenantId } }),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: multi-tenant scoping for service area lookup
    const area = await this.prisma.serviceArea.findFirst({
      where: { id, tenantId },
    });

    if (!area) {
      throw new NotFoundException('Service area not found');
    }

    return area;
  }

  async update(tenantId: string, id: string, dto: UpdateServiceAreaDto) {
    // findFirst: verify tenant ownership before service area update
    const area = await this.prisma.serviceArea.findFirst({
      where: { id, tenantId },
    });

    if (!area) {
      throw new NotFoundException('Service area not found');
    }

    const data: Record<string, string> = {};
    if (dto.name !== undefined) data.name = sanitizeInput(dto.name);

    return this.prisma.serviceArea.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    // findFirst: verify tenant ownership before service area delete
    const area = await this.prisma.serviceArea.findFirst({
      where: { id, tenantId },
    });

    if (!area) {
      throw new NotFoundException('Service area not found');
    }

    return this.prisma.serviceArea.delete({ where: { id } });
  }
}
