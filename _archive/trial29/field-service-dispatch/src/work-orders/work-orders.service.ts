import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { validateTransition } from './work-order-state-machine';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const status = dto.technicianId
      ? WorkOrderStatus.ASSIGNED
      : WorkOrderStatus.UNASSIGNED;

    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status,
      },
      include: { customer: true, technician: true },
    });
  }

  async findAll(companyId: string, status?: WorkOrderStatus) {
    return this.prisma.workOrder.findMany({
      where: { companyId, ...(status && { status }) },
      include: { customer: true, technician: true },
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
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        technicianId: dto.technicianId,
      },
      include: { customer: true, technician: true },
    });
  }

  async transitionStatus(
    companyId: string,
    id: string,
    toStatus: WorkOrderStatus,
    note?: string,
  ) {
    const workOrder = await this.findOne(companyId, id);

    validateTransition(workOrder.status, toStatus);

    const completedAt =
      toStatus === WorkOrderStatus.COMPLETED ? new Date() : undefined;

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: toStatus,
          ...(completedAt && { completedAt }),
          ...(toStatus === WorkOrderStatus.ASSIGNED &&
            workOrder.status === WorkOrderStatus.UNASSIGNED && {
              technicianId: workOrder.technicianId,
            }),
        },
        include: { customer: true, technician: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus,
          note,
        },
      }),
    ]);

    return updated;
  }

  async assignTechnician(
    companyId: string,
    workOrderId: string,
    technicianId: string,
  ) {
    const workOrder = await this.findOne(companyId, workOrderId);

    if (
      workOrder.status !== WorkOrderStatus.UNASSIGNED &&
      workOrder.status !== WorkOrderStatus.ASSIGNED
    ) {
      throw new BadRequestException(
        'Can only assign technician to UNASSIGNED or ASSIGNED work orders',
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id: workOrderId },
        data: {
          technicianId,
          status: WorkOrderStatus.ASSIGNED,
        },
        include: { customer: true, technician: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId,
          fromStatus: workOrder.status,
          toStatus: WorkOrderStatus.ASSIGNED,
          note: `Assigned to technician ${technicianId}`,
        },
      }),
    ]);

    return updated;
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id } });
  }

  async autoAssign(companyId: string, workOrderId: string) {
    const workOrder = await this.findOne(companyId, workOrderId);

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
      throw new BadRequestException(
        'Can only auto-assign UNASSIGNED work orders',
      );
    }

    const customer = workOrder.customer;

    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: 'AVAILABLE',
      },
    });

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians');
    }

    let nearest = availableTechnicians[0];
    let minDistance = Infinity;

    for (const tech of availableTechnicians) {
      if (
        tech.currentLat != null &&
        tech.currentLng != null &&
        customer.lat != null &&
        customer.lng != null
      ) {
        const dist = Math.sqrt(
          Math.pow(tech.currentLat - customer.lat, 2) +
            Math.pow(tech.currentLng - customer.lng, 2),
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearest = tech;
        }
      }
    }

    return this.assignTechnician(companyId, workOrderId, nearest.id);
  }
}
