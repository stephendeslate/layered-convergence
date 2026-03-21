import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderStatus, TechnicianStatus } from '../../generated/prisma/client.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  [WorkOrderStatus.UNASSIGNED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.UNASSIGNED],
  [WorkOrderStatus.EN_ROUTE]: [WorkOrderStatus.ON_SITE, WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ON_SITE]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [WorkOrderStatus.PAID],
  [WorkOrderStatus.PAID]: [],
};

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    if (dto.autoAssign) {
      const workOrder = await this.prisma.workOrder.create({
        data: {
          companyId,
          customerId: dto.customerId,
          priority: dto.priority,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          description: dto.description,
          status: WorkOrderStatus.UNASSIGNED,
        },
        include: { customer: true, technician: true },
      });
      return this.autoAssign(companyId, workOrder.id, dto.requiredSkills);
    }

    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        description: dto.description,
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
    // findFirst required: scoping by companyId for tenant isolation
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: { customer: true, technician: true, statusHistory: true },
    });
  }

  async transition(companyId: string, id: string, dto: TransitionWorkOrderDto) {
    // findFirst required: scoping by companyId for tenant isolation
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

    if (dto.status === WorkOrderStatus.UNASSIGNED) {
      data.technicianId = null;
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

  async assign(companyId: string, id: string, technicianId: string) {
    return this.transition(companyId, id, {
      status: WorkOrderStatus.ASSIGNED,
      technicianId,
      note: `Manually assigned to technician ${technicianId}`,
    });
  }

  async autoAssign(companyId: string, id: string, requiredSkills: string[] = []) {
    // findFirst required: scoping by companyId for tenant isolation
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
    const custLat = Number(workOrder.customer.lat);
    const custLng = Number(workOrder.customer.lng);

    if (custLat && custLng) {
      let minDist = Infinity;
      for (const tech of availableTechnicians) {
        if (tech.currentLat != null && tech.currentLng != null) {
          const dist = haversineDistance(
            custLat,
            custLng,
            Number(tech.currentLat),
            Number(tech.currentLng),
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
      orderBy: { timestamp: 'asc' },
    });
  }
}
