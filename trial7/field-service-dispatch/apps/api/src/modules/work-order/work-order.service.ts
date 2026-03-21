import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WorkOrderStatus } from '@prisma/client';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';

/**
 * Valid state transitions for the work order state machine.
 * UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID
 */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.UNASSIGNED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.UNASSIGNED],
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

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const initialStatus = dto.technicianId
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
        status: initialStatus,
        statusHistory: {
          create: {
            fromStatus: 'NONE',
            toStatus: initialStatus,
            note: 'Work order created',
          },
        },
      },
      include: { customer: true, technician: true, statusHistory: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(companyId: string, id: string) {
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

  /**
   * Transition a work order to a new state.
   * Convention 5.22: uses BadRequestException (not plain Error) for invalid transitions.
   */
  async transition(companyId: string, id: string, dto: TransitionWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    const allowedTransitions = VALID_TRANSITIONS[workOrder.status];
    if (!allowedTransitions.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${workOrder.status} to ${dto.toStatus}`,
      );
    }

    // Assignment validation
    if (dto.toStatus === WorkOrderStatus.ASSIGNED && !workOrder.technicianId) {
      throw new BadRequestException(
        'Cannot assign work order without a technician',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: dto.toStatus,
          note: dto.note,
        },
      });

      const updateData: Record<string, unknown> = { status: dto.toStatus };
      if (dto.toStatus === WorkOrderStatus.COMPLETED) {
        updateData['completedAt'] = new Date();
      }

      return tx.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          technician: true,
          statusHistory: { orderBy: { timestamp: 'asc' } },
        },
      });
    });
  }

  async assignTechnician(companyId: string, id: string, technicianId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
    });

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
      throw new BadRequestException('Can only assign technician to unassigned work orders');
    }

    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: WorkOrderStatus.UNASSIGNED,
          toStatus: WorkOrderStatus.ASSIGNED,
          note: `Assigned to technician ${technicianId}`,
        },
      });

      return tx.workOrder.update({
        where: { id },
        data: {
          technicianId,
          status: WorkOrderStatus.ASSIGNED,
        },
        include: { customer: true, technician: true },
      });
    });
  }

  /**
   * Validate state transition using exhaustive switch.
   * Convention 5.22: uses BadRequestException instead of plain Error.
   */
  getStatusLabel(status: WorkOrderStatus): string {
    switch (status) {
      case WorkOrderStatus.UNASSIGNED:
        return 'Unassigned';
      case WorkOrderStatus.ASSIGNED:
        return 'Assigned';
      case WorkOrderStatus.EN_ROUTE:
        return 'En Route';
      case WorkOrderStatus.ON_SITE:
        return 'On Site';
      case WorkOrderStatus.IN_PROGRESS:
        return 'In Progress';
      case WorkOrderStatus.COMPLETED:
        return 'Completed';
      case WorkOrderStatus.INVOICED:
        return 'Invoiced';
      case WorkOrderStatus.PAID:
        return 'Paid';
      default: {
        const _exhaustive: never = status;
        throw new BadRequestException(`Invalid work order status: ${_exhaustive}`);
      }
    }
  }

  async remove(companyId: string, id: string) {
    await this.prisma.workOrder.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
