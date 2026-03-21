import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderStatus, TechnicianStatus } from '@prisma/client';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';

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
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.create({
      data: {
        companyId: dto.companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        estimatedDuration: dto.estimatedDuration,
        status: dto.technicianId ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.UNASSIGNED,
      },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: workOrder.status,
        note: 'Work order created',
      },
    });

    // Side effect: update technician status when assigned
    if (dto.technicianId) {
      await this.prisma.technician.update({
        where: { id: dto.technicianId },
        data: { status: TechnicianStatus.BUSY },
      });
    }

    return workOrder;
  }

  async transition(id: string, dto: TransitionWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
      include: { technician: true },
    });

    const validTargets = VALID_TRANSITIONS[workOrder.status];
    if (!validTargets.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${workOrder.status} to ${dto.toStatus}. Valid targets: ${validTargets.join(', ')}`,
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { status: dto.toStatus },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: id,
        fromStatus: workOrder.status,
        toStatus: dto.toStatus,
        note: dto.note,
      },
    });

    // Side effects based on transition
    if (dto.toStatus === WorkOrderStatus.EN_ROUTE && workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.EN_ROUTE },
      });
    }

    if (dto.toStatus === WorkOrderStatus.COMPLETED && workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.AVAILABLE },
      });
    }

    this.logger.log(`Work order ${id}: ${workOrder.status} -> ${dto.toStatus}`);

    return updated;
  }

  async findAllByCompany(companyId: string, status?: WorkOrderStatus) {
    return this.prisma.workOrder.findMany({
      where: { companyId, status },
      include: { customer: true, technician: true },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.workOrder.findUniqueOrThrow({
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

  async getTimeline(id: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    return workOrder.statusHistory;
  }

  async assignTechnician(id: string, technicianId: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({ where: { id } });

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
      throw new BadRequestException('Work order is already assigned');
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        technicianId,
        status: WorkOrderStatus.ASSIGNED,
      },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: id,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: WorkOrderStatus.ASSIGNED,
        note: `Assigned to technician ${technicianId}`,
      },
    });

    await this.prisma.technician.update({
      where: { id: technicianId },
      data: { status: TechnicianStatus.BUSY },
    });

    return updated;
  }
}
