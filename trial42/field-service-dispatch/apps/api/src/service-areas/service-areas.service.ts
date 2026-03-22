// TRACED: FD-SERVICE-AREAS-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams } from '@field-service-dispatch/shared';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';

@Injectable()
export class ServiceAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceAreaDto) {
    return this.prisma.serviceArea.create({
      data: dto,
    });
  }

  async findAll(page?: number, pageSize?: number, tenantId?: string) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const where = tenantId ? { tenantId } : {};

    const [data, total] = await Promise.all([
      this.prisma.serviceArea.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { name: 'asc' },
      }),
      this.prisma.serviceArea.count({ where }),
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
    // findFirst justification: lookup by primary key for single entity retrieval
    const serviceArea = await this.prisma.serviceArea.findFirst({
      where: { id },
    });

    if (!serviceArea) {
      throw new NotFoundException(`Service area ${id} not found`);
    }

    return serviceArea;
  }

  async update(id: string, dto: UpdateServiceAreaDto) {
    await this.findOne(id);
    return this.prisma.serviceArea.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.serviceArea.delete({ where: { id } });
  }
}
