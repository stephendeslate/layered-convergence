import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
// TRACED: FD-WORK-ORDER-SERVICE
import { normalizePageParams } from '@field-service-dispatch/shared';

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkOrderDto, tenantId: string) {
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        tenantId,
        technicianId: dto.technicianId,
        notes: dto.notes,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        latitude: true,
        longitude: true,
        address: true,
        technicianId: true,
        scheduledDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { tenantId },
        skip,
        take: ps,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          address: true,
          technicianId: true,
          scheduledDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { tenantId } }),
    ]);

    return {
      data,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for RLS-like filtering at app level
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        latitude: true,
        longitude: true,
        address: true,
        technicianId: true,
        scheduledDate: true,
        completedDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.technicianId !== undefined && { technicianId: dto.technicianId }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        address: true,
        technicianId: true,
        notes: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.workOrder.delete({ where: { id } });
    return { deleted: true };
  }
}
