import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { normalizePageParams } from '@field-service-dispatch/shared';

// TRACED: FD-TECHNICIAN-SERVICE
@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnicianDto, tenantId: string) {
    return this.prisma.technician.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        specialties: dto.specialties,
        latitude: dto.latitude,
        longitude: dto.longitude,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        specialties: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { tenantId },
        skip,
        take: ps,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          specialties: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { tenantId } }),
    ]);

    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for multi-tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        specialties: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        workOrders: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async update(id: string, dto: UpdateTechnicianDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.technician.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.specialties !== undefined && { specialties: dto.specialties }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        specialties: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.technician.delete({ where: { id } });
    return { deleted: true };
  }
}
