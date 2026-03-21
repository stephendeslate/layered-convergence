import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.ON_HOLD],
  [WorkOrderStatus.ON_HOLD]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, invoices: true },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  async create(dto: CreateWorkOrderDto, companyId: string) {
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 1,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        status: dto.technicianId ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.PENDING,
        companyId,
      },
      include: { customer: true, technician: true },
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto, companyId: string) {
    await this.findById(id, companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data: dto,
      include: { customer: true, technician: true },
    });
  }

  async transition(id: string, newStatus: WorkOrderStatus, companyId: string) {
    const workOrder = await this.findById(id, companyId);

    const allowedTransitions = VALID_TRANSITIONS[workOrder.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === WorkOrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: { customer: true, technician: true },
    });
  }

  getValidTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
    return VALID_TRANSITIONS[status] ?? [];
  }
}
