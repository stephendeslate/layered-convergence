import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { normalizePageParams } from '@field-service-dispatch/shared';

// TRACED: FD-SERVICE-AREA-SERVICE
@Injectable()
export class ServiceAreaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceAreaDto, tenantId: string) {
    return this.prisma.serviceArea.create({
      data: {
        name: dto.name,
        zipCodes: dto.zipCodes,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radius: dto.radius,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        zipCodes: true,
        latitude: true,
        longitude: true,
        radius: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.serviceArea.findMany({
        where: { tenantId },
        skip,
        take: ps,
        select: {
          id: true,
          name: true,
          zipCodes: true,
          active: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceArea.count({ where: { tenantId } }),
    ]);

    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for multi-tenant isolation
    const serviceArea = await this.prisma.serviceArea.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        zipCodes: true,
        latitude: true,
        longitude: true,
        radius: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!serviceArea) {
      throw new NotFoundException('Service area not found');
    }
    return serviceArea;
  }

  async update(id: string, dto: UpdateServiceAreaDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.serviceArea.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.zipCodes !== undefined && { zipCodes: dto.zipCodes }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.radius !== undefined && { radius: dto.radius }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
      select: {
        id: true,
        name: true,
        zipCodes: true,
        latitude: true,
        longitude: true,
        radius: true,
        active: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.serviceArea.delete({ where: { id } });
    return { deleted: true };
  }
}
