// TRACED: FD-TECHNICIANS-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams } from '@field-service-dispatch/shared';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: dto,
    });
  }

  async findAll(page?: number, pageSize?: number, tenantId?: string) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const where = tenantId ? { tenantId } : {};

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        include: { workOrders: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where }),
    ]);

    return {
      data,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  }

  async findOne(id: string) {
    // findFirst justification: lookup by primary key with related data
    const technician = await this.prisma.technician.findFirst({
      where: { id },
      include: { workOrders: true, schedules: true },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }

    return technician;
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    await this.findOne(id);
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.technician.delete({ where: { id } });
  }
}
