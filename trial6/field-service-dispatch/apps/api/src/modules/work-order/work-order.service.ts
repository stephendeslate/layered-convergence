import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, AssignWorkOrderDto, WorkOrderQueryDto } from './dto/create-work-order.dto';
import { WorkOrderStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

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

  async create(dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        trackingToken: randomBytes(16).toString('hex'),
      },
    });
  }

  async transition(id: string, toStatus: WorkOrderStatus, note?: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id },
    });

    const allowed = VALID_TRANSITIONS[workOrder.status];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${workOrder.status} to ${toStatus}`,
      );
    }

    // Exhaustive switch for type safety
    switch (toStatus) {
      case WorkOrderStatus.UNASSIGNED:
      case WorkOrderStatus.ASSIGNED:
      case WorkOrderStatus.EN_ROUTE:
      case WorkOrderStatus.ON_SITE:
      case WorkOrderStatus.IN_PROGRESS:
      case WorkOrderStatus.COMPLETED:
      case WorkOrderStatus.INVOICED:
      case WorkOrderStatus.PAID:
        break;
      default: {
        const _exhaustive: never = toStatus;
        throw new Error(`Unhandled work order status: ${_exhaustive}`);
      }
    }

    const additionalData: Record<string, Date> = {};
    if (toStatus === WorkOrderStatus.IN_PROGRESS) additionalData.startedAt = new Date();
    if (toStatus === WorkOrderStatus.COMPLETED) additionalData.completedAt = new Date();

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: { status: toStatus, ...additionalData },
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

  async assign(id: string, dto: AssignWorkOrderDto) {
    await this.prisma.workOrder.update({
      where: { id },
      data: { technicianId: dto.technicianId },
    });
    return this.transition(id, WorkOrderStatus.ASSIGNED, `Assigned to technician ${dto.technicianId}`);
  }

  async findAll(query: WorkOrderQueryDto) {
    return this.prisma.workOrder.findMany({
      where: {
        ...(query.companyId ? { companyId: query.companyId } : {}),
        ...(query.technicianId ? { technicianId: query.technicianId } : {}),
        ...(query.status ? { status: query.status as WorkOrderStatus } : {}),
      },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async findByTrackingToken(token: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { trackingToken: token },
      include: {
        customer: true,
        technician: { select: { id: true, name: true, currentLat: true, currentLng: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }
}
