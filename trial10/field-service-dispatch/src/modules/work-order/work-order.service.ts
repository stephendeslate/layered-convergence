import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkOrderDto, TransitionWorkOrderDto } from './dto/create-work-order.dto';

/**
 * Valid state transitions for the work order state machine.
 * Uses BadRequestException for invalid transitions (convention 5.24).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  unassigned: ['assigned'],
  assigned: ['en_route', 'unassigned'],
  en_route: ['on_site'],
  on_site: ['in_progress'],
  in_progress: ['completed'],
  completed: ['invoiced'],
  invoiced: ['paid'],
  paid: [],
};

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority,
        title: dto.title,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: dto.technicianId ? 'assigned' : 'unassigned',
      },
      include: { customer: true, technician: true },
    });
  }

  async findAllByCompany(companyId: string, status?: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { timestamp: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    return this.prisma.workOrder.findUniqueOrThrow({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
        jobPhotos: true,
        invoice: true,
      },
    });
  }

  async transition(id: string, companyId: string, dto: TransitionWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id, companyId },
    });

    const allowedTransitions = VALID_TRANSITIONS[workOrder.status];
    if (!allowedTransitions || !allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${workOrder.status} -> ${dto.status}. Allowed: ${allowedTransitions?.join(', ') ?? 'none'}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: dto.status,
          note: dto.note,
        },
      });

      return tx.workOrder.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === 'completed' ? { completedAt: new Date() } : {}),
          ...(dto.note ? { notes: dto.note } : {}),
        },
        include: { statusHistory: true, customer: true, technician: true },
      });
    });
  }

  async assign(id: string, companyId: string, technicianId: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id, companyId },
    });

    if (workOrder.status !== 'unassigned') {
      throw new BadRequestException('Work order must be unassigned to assign');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: 'unassigned',
          toStatus: 'assigned',
          note: `Assigned to technician ${technicianId}`,
        },
      });

      return tx.workOrder.update({
        where: { id },
        data: { technicianId, status: 'assigned' },
        include: { customer: true, technician: true },
      });
    });
  }

  async getAnalytics(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
    });

    const completed = workOrders.filter((wo) => wo.completedAt);
    const avgCompletionTime = completed.length > 0
      ? completed.reduce((sum, wo) => {
          const duration = wo.completedAt!.getTime() - wo.createdAt.getTime();
          return sum + duration;
        }, 0) / completed.length / (1000 * 60 * 60) // hours
      : 0;

    return {
      total: workOrders.length,
      byStatus: workOrders.reduce(
        (acc, wo) => {
          acc[wo.status] = (acc[wo.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPriority: workOrders.reduce(
        (acc, wo) => {
          acc[wo.priority] = (acc[wo.priority] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      completedCount: completed.length,
      avgCompletionTimeHours: Math.round(avgCompletionTime * 100) / 100,
    };
  }

  async remove(id: string, companyId: string) {
    return this.prisma.workOrder.delete({ where: { id, companyId } });
  }
}
