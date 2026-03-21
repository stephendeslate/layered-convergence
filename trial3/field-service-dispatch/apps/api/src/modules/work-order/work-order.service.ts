import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidTransition, getValidTargets } from '@field-service-dispatch/shared';

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, data: {
    customerId: string;
    priority?: string;
    description: string;
    serviceType: string;
    scheduledAt?: Date;
    estimatedDuration?: number;
  }) {
    // Verify customer belongs to company
    await this.prisma.customer.findFirstOrThrow({
      where: { id: data.customerId, companyId },
    });

    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: data.customerId,
        priority: (data.priority ?? 'MEDIUM') as never,
        description: data.description,
        serviceType: data.serviceType,
        scheduledAt: data.scheduledAt,
        estimatedDuration: data.estimatedDuration,
      },
      include: { customer: true },
    });
  }

  async findByIdAndCompany(id: string, companyId: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  async findAllByCompany(companyId: string, filters?: { status?: string; technicianId?: string }) {
    return this.prisma.workOrder.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status as never } : {}),
        ...(filters?.technicianId ? { technicianId: filters.technicianId } : {}),
      },
      include: {
        customer: true,
        technician: { select: { id: true, name: true, skills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assign(id: string, companyId: string, technicianId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    // Verify technician belongs to same company
    const technician = await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    if (workOrder.status !== 'UNASSIGNED' && workOrder.status !== 'ASSIGNED') {
      throw new BadRequestException(
        `Cannot assign work order in ${workOrder.status} state`,
      );
    }

    const fromStatus = workOrder.status;

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: { technicianId, status: 'ASSIGNED' },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus,
          toStatus: 'ASSIGNED',
          note: `Assigned to ${technician.name}`,
        },
      }),
      this.prisma.technician.update({
        where: { id: technicianId },
        data: { status: 'BUSY' },
      }),
    ]);

    return updated;
  }

  async transitionStatus(id: string, companyId: string, toStatus: string, note?: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    const fromStatus = workOrder.status;

    if (!isValidTransition(fromStatus, toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${fromStatus} to ${toStatus}. Valid targets: ${getValidTargets(fromStatus).join(', ') || 'none (terminal state)'}`,
      );
    }

    const updates: Parameters<typeof this.prisma.$transaction>[0] = [
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: toStatus as never,
          ...(toStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(toStatus === 'UNASSIGNED' ? { technicianId: null } : {}),
        },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus,
          toStatus,
          note,
        },
      }),
    ];

    // Side effects
    if (toStatus === 'COMPLETED' && workOrder.technicianId) {
      updates.push(
        this.prisma.technician.update({
          where: { id: workOrder.technicianId },
          data: { status: 'AVAILABLE' },
        }),
      );
    }

    if (toStatus === 'UNASSIGNED' && workOrder.technicianId) {
      updates.push(
        this.prisma.technician.update({
          where: { id: workOrder.technicianId },
          data: { status: 'AVAILABLE' },
        }),
      );
    }

    const [updated] = await this.prisma.$transaction(updates);
    return updated;
  }

  async autoAssign(id: string, companyId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId, status: 'UNASSIGNED' },
      include: { customer: true },
    });

    // Find available technicians with matching skills
    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: 'AVAILABLE',
        skills: { has: workOrder.serviceType },
      },
    });

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians with matching skills');
    }

    // Sort by distance (Haversine approximation)
    const customerLat = workOrder.customer.lat;
    const customerLng = workOrder.customer.lng;

    const sorted = availableTechnicians
      .filter((t) => t.currentLat !== null && t.currentLng !== null)
      .sort((a, b) => {
        const distA = haversineDistance(a.currentLat!, a.currentLng!, customerLat, customerLng);
        const distB = haversineDistance(b.currentLat!, b.currentLng!, customerLat, customerLng);
        return distA - distB;
      });

    const nearest = sorted[0] ?? availableTechnicians[0];
    return this.assign(id, companyId, nearest.id);
  }

  // Static route: /stats [VERIFY:ROUTE_ORDERING]
  async getStats(companyId: string) {
    const [total, completed, inProgress, unassigned] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'COMPLETED' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'UNASSIGNED' } }),
    ]);

    return { total, completed, inProgress, unassigned };
  }

  // Static route: /tracking/:token [VERIFY:ROUTE_ORDERING]
  async findByTrackingToken(token: string) {
    return this.prisma.workOrder.findUniqueOrThrow({
      where: { trackingToken: token },
      include: {
        customer: { select: { name: true, address: true } },
        technician: { select: { id: true, name: true, currentLat: true, currentLng: true } },
        statusHistory: { orderBy: { timestamp: 'asc' } },
        company: { select: { name: true, primaryColor: true, logoUrl: true } },
      },
    });
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
