import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

/**
 * Valid state transitions for the work order lifecycle.
 * CREATED → ASSIGNED → EN_ROUTE → IN_PROGRESS → ON_HOLD → COMPLETED → INVOICED → PAID → CLOSED
 * ON_HOLD can return to IN_PROGRESS (pause/resume)
 * IN_PROGRESS can go to ON_HOLD or COMPLETED
 */
export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.CREATED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.EN_ROUTE],
  [WorkOrderStatus.EN_ROUTE]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED],
  [WorkOrderStatus.ON_HOLD]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [WorkOrderStatus.PAID],
  [WorkOrderStatus.PAID]: [WorkOrderStatus.CLOSED],
  [WorkOrderStatus.CLOSED]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? WorkOrderPriority.MEDIUM,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        companyId,
        status: dto.technicianId ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.CREATED,
      },
      include: { customer: true, technician: true },
    });
  }

  async findAll(companyId: string, status?: WorkOrderStatus) {
    // Always filter by companyId for tenant isolation
    return this.prisma.workOrder.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
      },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    // findFirst with companyId ensures tenant isolation — only returns
    // work orders belonging to the requesting company
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, invoices: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.findById(companyId, id);

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.customerId !== undefined && { customerId: dto.customerId }),
      },
      include: { customer: true, technician: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findById(companyId, id);

    return this.prisma.workOrder.delete({ where: { id } });
  }

  async transition(companyId: string, id: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findById(companyId, id);
    const allowedTransitions = VALID_TRANSITIONS[workOrder.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    const data: Record<string, unknown> = { status: newStatus };

    // Set completedAt when transitioning to COMPLETED
    if (newStatus === WorkOrderStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
      include: { customer: true, technician: true },
    });
  }

  async assign(companyId: string, id: string, technicianId: string) {
    const workOrder = await this.findById(companyId, id);

    // Validate technician belongs to the same company — tenant boundary check
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
    });

    if (!technician) {
      throw new ForbiddenException(
        'Technician not found or does not belong to your company',
      );
    }

    // Auto-transition to ASSIGNED if currently CREATED
    const data: Record<string, unknown> = { technicianId };
    if (workOrder.status === WorkOrderStatus.CREATED) {
      data.status = WorkOrderStatus.ASSIGNED;
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
      include: { customer: true, technician: true },
    });
  }

  async getCountsByStatus(companyId: string) {
    const counts = await this.prisma.workOrder.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { status: true },
    });

    const result: Record<string, number> = {};
    for (const status of Object.values(WorkOrderStatus)) {
      result[status] = 0;
    }
    for (const item of counts) {
      result[item.status] = item._count.status;
    }

    return result;
  }

  getValidTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
    return VALID_TRANSITIONS[status] ?? [];
  }
}
