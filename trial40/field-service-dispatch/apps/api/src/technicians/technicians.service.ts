// TRACED: FD-TECH-003 — Technicians service with select optimization
// TRACED: FD-PERF-007 — Prisma select on technician list queries
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { paginate, generateId, sanitizeInput } from '@field-service-dispatch/shared';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTechnicianDto) {
    const sanitizedName = sanitizeInput(dto.name);

    return this.prisma.technician.create({
      data: {
        id: generateId('tech'),
        name: sanitizedName,
        specialty: dto.specialty,
        latitude: dto.latitude,
        longitude: dto.longitude,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          specialty: true,
          status: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { tenantId } }),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: multi-tenant scoping for technician lookup
    const technician = await this.prisma.technician.findFirst({
      where: { id, tenantId },
      include: { schedules: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async update(tenantId: string, id: string, dto: UpdateTechnicianDto) {
    // findFirst: verify tenant ownership before technician update
    const technician = await this.prisma.technician.findFirst({
      where: { id, tenantId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    const data: Record<string, string> = {};
    if (dto.name !== undefined) data.name = sanitizeInput(dto.name);
    if (dto.specialty !== undefined) data.specialty = dto.specialty;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;

    return this.prisma.technician.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    // findFirst: verify tenant ownership before technician delete
    const technician = await this.prisma.technician.findFirst({
      where: { id, tenantId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return this.prisma.technician.delete({ where: { id } });
  }
}
