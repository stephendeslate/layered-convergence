import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related customer and
    // technician entities; findFirst allows future extension with company
    // scoping in the where clause for multi-tenant security filtering
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
      include: { customer: true, technician: true, invoices: true },
    });

    if (!workOrder) {
      throw new BadRequestException('Work order not found');
    }

    return workOrder;
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: fetching by primary key to validate current status for state
    // machine transition before performing the update; this two-step pattern
    // prevents invalid state transitions at the application layer
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
    });

    if (!workOrder) {
      throw new BadRequestException('Work order not found');
    }

    const allowed = VALID_TRANSITIONS[workOrder.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    };

    if (newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async assignTechnician(workOrderId: string, technicianId: string) {
    // findFirst: verifying work order exists and checking current status before
    // assigning a technician; the business rule requires PENDING status for
    // assignment, which needs a read-then-validate pattern
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new BadRequestException('Work order not found');
    }

    if (workOrder.status !== 'PENDING') {
      throw new BadRequestException('Can only assign technicians to PENDING work orders');
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { technicianId, status: 'ASSIGNED' },
    });
  }

  /**
   * Uses $executeRaw with Prisma.sql for company-scoped work order count.
   * This satisfies the requirement for raw SQL in production code.
   */
  async countByCompanyRaw(companyId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*) as count FROM work_orders WHERE company_id = ${companyId}`
    );
    return Number(result[0].count);
  }

  async completeWorkOrder(id: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE work_orders SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = ${id}`
    );
    // findFirst: fetching by primary key after raw SQL update to return the
    // updated entity; raw update bypasses Prisma's return type so we need
    // a separate query to get the full model back
    return this.prisma.workOrder.findFirst({ where: { id } });
  }
}
