// [TRACED:FD-AC-001] WorkOrder CRUD with company isolation
// [TRACED:FD-AC-002] WorkOrder state machine with validated transitions
// [TRACED:FD-PV-002] Work order state machine enforces valid transitions only
// [TRACED:FD-PV-003] Work order sets completedAt on COMPLETED transition
// [TRACED:FD-SA-004] validateTransition used in work-order service
// [TRACED:FD-SA-006] findFirst calls have justification comments

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';
import { validateTransition, WORK_ORDER_TRANSITIONS } from '@field-service-dispatch/shared';

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    priority: string;
    customerId: string;
    technicianId?: string;
    scheduledAt?: Date;
    companyId: string;
  }) {
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        customerId: data.customerId,
        technicianId: data.technicianId,
        scheduledAt: data.scheduledAt,
        companyId: data.companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: querying by id + companyId (no unique constraint on this composite)
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async transition(id: string, companyId: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findOne(id, companyId);

    try {
      validateTransition(workOrder.status, newStatus, WORK_ORDER_TRANSITIONS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid transition';
      throw new BadRequestException(message);
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
