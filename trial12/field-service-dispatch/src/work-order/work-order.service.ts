import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderStatus, TechnicianStatus } from '../../generated/prisma/client.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  [WorkOrderStatus.UNASSIGNED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.EN_ROUTE],
  [WorkOrderStatus.EN_ROUTE]: [WorkOrderStatus.ON_SITE],
  [WorkOrderStatus.ON_SITE]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [WorkOrderStatus.PAID],
  [WorkOrderStatus.PAID]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        description: dto.description,
        notes: dto.notes,
        status: dto.technicianId ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.UNASSIGNED,
      },
      include: { customer: true, technician: true },
    });
  }

  findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
    });
  }

  findOne(companyId: string, id: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: { customer: true, technician: true, statusHistory: true },
    });
  }

  async transition(companyId: string, id: string, dto: TransitionWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    const allowed = VALID_TRANSITIONS[workOrder.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid transition from ${workOrder.status} to ${dto.status}`,
      );
    }

    const data: Record<string, unknown> = { status: dto.status };

    if (dto.status === WorkOrderStatus.ASSIGNED && dto.technicianId) {
      data.technicianId = dto.technicianId;
    }

    if (dto.status === WorkOrderStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data,
        include: { customer: true, technician: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: dto.status,
          note: dto.note,
        },
      }),
    ]);

    return updated;
  }

  async autoAssign(companyId: string, id: string, requiredSkills: string[] = []) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: { customer: true },
    });

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
      throw new BadRequestException('Work order must be UNASSIGNED for auto-assign');
    }

    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: TechnicianStatus.AVAILABLE,
        ...(requiredSkills.length > 0
          ? { skills: { hasSome: requiredSkills } }
          : {}),
      },
    });

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians found');
    }

    let nearest = availableTechnicians[0];

    if (workOrder.customer.lat && workOrder.customer.lng) {
      const custLat = Number(workOrder.customer.lat);
      const custLng = Number(workOrder.customer.lng);

      let minDist = Infinity;
      for (const tech of availableTechnicians) {
        if (tech.currentLat && tech.currentLng) {
          const dist = Math.sqrt(
            Math.pow(Number(tech.currentLat) - custLat, 2) +
            Math.pow(Number(tech.currentLng) - custLng, 2),
          );
          if (dist < minDist) {
            minDist = dist;
            nearest = tech;
          }
        }
      }
    }

    return this.transition(companyId, id, {
      status: WorkOrderStatus.ASSIGNED,
      technicianId: nearest.id,
      note: `Auto-assigned to ${nearest.name}`,
    });
  }

  getHistory(companyId: string, id: string) {
    return this.prisma.workOrderStatusHistory.findMany({
      where: {
        workOrder: { id, companyId },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
