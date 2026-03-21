import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkOrderDto, TransitionWorkOrderDto, AssignWorkOrderDto } from './work-order.dto';

// Valid state transitions for the work order state machine
const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED'],
  EN_ROUTE: ['ON_SITE'],
  ON_SITE: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority ?? 'MEDIUM',
        status: dto.technicianId ? 'ASSIGNED' : 'UNASSIGNED',
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
      include: { customer: true, technician: true },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  // [PUBLIC_ENDPOINT] Customer tracking — accessed by work order token, no tenant scope
  async findByTrackingToken(token: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id: token },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        technician: {
          select: { name: true, currentLat: true, currentLng: true },
        },
        customer: {
          select: { name: true, address: true, lat: true, lng: true },
        },
      },
    });
  }

  async assign(companyId: string, id: string, dto: AssignWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    if (workOrder.status !== 'UNASSIGNED') {
      throw new BadRequestException('Can only assign work orders in UNASSIGNED status');
    }

    // Verify technician belongs to same company
    await this.prisma.technician.findFirstOrThrow({
      where: { id: dto.technicianId, companyId },
    });

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workOrder.update({
        where: { id },
        data: {
          technicianId: dto.technicianId,
          status: 'ASSIGNED',
        },
        include: { customer: true, technician: true },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: 'UNASSIGNED',
          toStatus: 'ASSIGNED',
          note: `Assigned to technician ${dto.technicianId}`,
        },
      });

      return updated;
    });
  }

  async transition(companyId: string, id: string, dto: TransitionWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: { technician: true },
    });

    const allowedNext = VALID_TRANSITIONS[workOrder.status] ?? [];
    if (!allowedNext.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${dto.toStatus}. ` +
        `Allowed: ${allowedNext.join(', ') || 'none'}`,
      );
    }

    // Side effect: EN_ROUTE sets technician status to EN_ROUTE
    if (dto.toStatus === 'EN_ROUTE' && workOrder.technician) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.workOrder.update({
          where: { id },
          data: { status: dto.toStatus as never },
          include: { customer: true, technician: true },
        });

        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: id,
            fromStatus: workOrder.status,
            toStatus: dto.toStatus as never,
            note: dto.note,
          },
        });

        await tx.technician.update({
          where: { id: workOrder.technicianId! },
          data: { status: 'EN_ROUTE' },
        });

        return updated;
      });
    }

    // Side effect: ON_SITE sets technician status to ON_SITE
    if (dto.toStatus === 'ON_SITE' && workOrder.technician) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.workOrder.update({
          where: { id },
          data: { status: dto.toStatus as never },
          include: { customer: true, technician: true },
        });

        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: id,
            fromStatus: workOrder.status,
            toStatus: dto.toStatus as never,
            note: dto.note,
          },
        });

        await tx.technician.update({
          where: { id: workOrder.technicianId! },
          data: { status: 'ON_SITE' },
        });

        return updated;
      });
    }

    // Side effect: COMPLETED sets technician status to AVAILABLE and records completedAt
    if (dto.toStatus === 'COMPLETED' && workOrder.technician) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.workOrder.update({
          where: { id },
          data: {
            status: dto.toStatus as never,
            completedAt: new Date(),
          },
          include: { customer: true, technician: true },
        });

        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: id,
            fromStatus: workOrder.status,
            toStatus: dto.toStatus as never,
            note: dto.note,
          },
        });

        await tx.technician.update({
          where: { id: workOrder.technicianId! },
          data: { status: 'AVAILABLE' },
        });

        return updated;
      });
    }

    // Default transition without side effects
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workOrder.update({
        where: { id },
        data: {
          status: dto.toStatus as never,
          ...(dto.toStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
        },
        include: { customer: true, technician: true },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: dto.toStatus as never,
          note: dto.note,
        },
      });

      return updated;
    });
  }

  async getStats(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
    });

    const byStatus = workOrders.reduce(
      (acc, wo) => {
        acc[wo.status] = (acc[wo.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const completed = workOrders.filter((wo) => wo.completedAt);
    const avgCompletionTime = completed.length > 0
      ? completed.reduce((sum, wo) => {
          const duration = wo.completedAt!.getTime() - wo.createdAt.getTime();
          return sum + duration;
        }, 0) / completed.length / (1000 * 60 * 60) // hours
      : 0;

    return {
      total: workOrders.length,
      byStatus,
      avgCompletionTimeHours: Math.round(avgCompletionTime * 10) / 10,
    };
  }
}
