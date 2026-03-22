// TRACED: FD-TECH-003 — Technicians service with generateId
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, generateId, sanitizeInput } from '@field-service-dispatch/shared';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; latitude: string; longitude: string }) {
    const sanitizedName = sanitizeInput(data.name);

    return this.prisma.technician.create({
      data: {
        id: generateId('tech'),
        name: sanitizedName,
        status: 'AVAILABLE',
        latitude: data.latitude,
        longitude: data.longitude,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.technician.count({ where: { tenantId } }),
    ]);
    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scoping by tenantId for RLS — technician ID alone is not sufficient
    const technician = await this.prisma.technician.findFirst({
      where: { id, tenantId },
      include: { schedules: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }
}
