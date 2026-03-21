// TRACED:WO_STATE_MACHINE — WorkOrder transitions enforce OPEN->ASSIGNED->IN_PROGRESS->COMPLETED->INVOICED->CLOSED plus CANCELLED
// TRACED:STATE_CONFLICT_409 — Invalid state transitions return HTTP 409
// TRACED:FINDFIRST_JUSTIFIED — Every findFirst call has a justification comment

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_TRANSITIONS: Record<string, WorkOrderStatus[]> = {
  OPEN: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  ASSIGNED: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  IN_PROGRESS: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  COMPLETED: [WorkOrderStatus.INVOICED],
  INVOICED: [WorkOrderStatus.CLOSED],
  CLOSED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope; unique within company context
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, invoices: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    scheduledDate?: Date;
    customerId: string;
    technicianId?: string;
    companyId: string;
  }) {
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        scheduledDate: data.scheduledDate,
        customerId: data.customerId,
        technicianId: data.technicianId,
        companyId: data.companyId,
        status: WorkOrderStatus.OPEN,
      },
    });
  }

  async update(
    id: string,
    companyId: string,
    data: { title?: string; description?: string; priority?: string; scheduledDate?: Date },
  ) {
    await this.findOne(id, companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  async transition(id: string, companyId: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findOne(id, companyId);
    const currentStatus = workOrder.status;
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new ConflictException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === WorkOrderStatus.COMPLETED) {
      updateData.completedDate = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });
  }
}
