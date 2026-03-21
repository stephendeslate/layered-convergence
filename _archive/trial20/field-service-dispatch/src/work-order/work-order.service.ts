import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderStatus } from '../../generated/prisma/client.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  UNASSIGNED: ['ASSIGNED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED'],
  EN_ROUTE: ['ON_SITE', 'ASSIGNED'],
  ON_SITE: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: [],
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

  async create(dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId: dto.companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        description: dto.description,
        notes: dto.notes,
      },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: scoping by both id and companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, statusHistory: true },
    });
    if (!workOrder) {
      throw new NotFoundException(`Work order ${id} not found`);
    }
    return workOrder;
  }

  async transition(
    id: string,
    companyId: string,
    toStatus: WorkOrderStatus,
    data?: { technicianId?: string; note?: string },
  ) {
    const workOrder = await this.findOne(id, companyId);
    const fromStatus = workOrder.status;

    const allowed = VALID_TRANSITIONS[fromStatus];
    if (!allowed || !allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${fromStatus} to ${toStatus}`,
      );
    }

    const updateData: Record<string, unknown> = { status: toStatus };
    if (data?.technicianId) {
      updateData.technicianId = data.technicianId;
    }
    if (toStatus === 'UNASSIGNED') {
      updateData.technicianId = null;
    }
    if (toStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: updateData,
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus,
          toStatus,
          note: data?.note,
        },
      }),
    ]);

    return updated;
  }

  async assign(id: string, companyId: string, technicianId: string) {
    return this.transition(id, companyId, 'ASSIGNED', { technicianId });
  }

  async unassign(id: string, companyId: string) {
    return this.transition(id, companyId, 'UNASSIGNED');
  }

  async enRoute(id: string, companyId: string) {
    return this.transition(id, companyId, 'EN_ROUTE');
  }

  async onSite(id: string, companyId: string) {
    return this.transition(id, companyId, 'ON_SITE');
  }

  async start(id: string, companyId: string) {
    return this.transition(id, companyId, 'IN_PROGRESS');
  }

  async complete(id: string, companyId: string) {
    return this.transition(id, companyId, 'COMPLETED');
  }

  async returnToAssigned(id: string, companyId: string) {
    return this.transition(id, companyId, 'ASSIGNED');
  }

  async autoAssign(id: string, companyId: string) {
    const workOrder = await this.findOne(id, companyId);

    if (workOrder.status !== 'UNASSIGNED') {
      throw new BadRequestException(
        `Work order must be UNASSIGNED to auto-assign, current status: ${workOrder.status}`,
      );
    }

    const customerLat = workOrder.customer.lat
      ? Number(workOrder.customer.lat)
      : null;
    const customerLng = workOrder.customer.lng
      ? Number(workOrder.customer.lng)
      : null;

    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: 'AVAILABLE',
      },
    });

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians found');
    }

    let bestTechnician = availableTechnicians[0];

    if (customerLat !== null && customerLng !== null) {
      let bestDistance = Infinity;

      for (const tech of availableTechnicians) {
        if (tech.currentLat !== null && tech.currentLng !== null) {
          const techLat = Number(tech.currentLat);
          const techLng = Number(tech.currentLng);
          const distance = haversineDistance(
            customerLat,
            customerLng,
            techLat,
            techLng,
          );
          if (distance < bestDistance) {
            bestDistance = distance;
            bestTechnician = tech;
          }
        }
      }
    }

    return this.transition(id, companyId, 'ASSIGNED', {
      technicianId: bestTechnician.id,
    });
  }
}
