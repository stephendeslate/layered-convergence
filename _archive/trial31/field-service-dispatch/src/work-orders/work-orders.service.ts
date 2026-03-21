import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import { validateTransition } from './work-order-state-machine';
import { WorkOrderStatus } from '@prisma/client';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const status: WorkOrderStatus = dto.technicianId
      ? 'ASSIGNED'
      : 'UNASSIGNED';

    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: {
        customer: true,
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { changedAt: 'desc' } },
        photos: true,
        invoice: true,
      },
    });
    if (!workOrder) {
      throw new NotFoundException(`Work order ${id} not found`);
    }
    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        technicianId: dto.technicianId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async transitionStatus(
    companyId: string,
    id: string,
    dto: TransitionStatusDto,
  ) {
    const workOrder = await this.findOne(companyId, id);
    const fromStatus = workOrder.status as WorkOrderStatus;
    const toStatus = dto.status;

    validateTransition(fromStatus, toStatus);

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: toStatus,
          completedAt: toStatus === 'COMPLETED' ? new Date() : undefined,
        },
        include: {
          customer: true,
          technician: true,
        },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus,
          toStatus,
          note: dto.note,
        },
      }),
    ]);

    return updated;
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id } });
  }

  async autoAssign(companyId: string, id: string) {
    const workOrder = await this.findOne(companyId, id);

    if (workOrder.status !== 'UNASSIGNED') {
      return workOrder;
    }

    const customer = workOrder.customer;
    if (!customer.lat || !customer.lng) {
      return workOrder;
    }

    const available = await this.prisma.technician.findMany({
      where: { companyId, status: 'AVAILABLE' },
    });

    if (available.length === 0) {
      return workOrder;
    }

    let nearest = available[0];
    let minDist = Infinity;

    for (const tech of available) {
      if (tech.currentLat !== null && tech.currentLng !== null) {
        const dist = Math.sqrt(
          Math.pow(tech.currentLat - customer.lat, 2) +
            Math.pow(tech.currentLng - customer.lng, 2),
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = tech;
        }
      }
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          technicianId: nearest.id,
          status: 'ASSIGNED',
        },
        include: {
          customer: true,
          technician: true,
        },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: 'UNASSIGNED',
          toStatus: 'ASSIGNED',
          note: `Auto-assigned to ${nearest.name}`,
        },
      }),
    ]);

    return updated;
  }
}
