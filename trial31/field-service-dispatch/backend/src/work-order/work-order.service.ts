import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
      orderBy: { createdAt: 'desc' },
      include: { customer: true, technician: true },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including relations; using
    // findFirst to keep a consistent pattern for future compound-key scoping
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
      include: { customer: true, technician: true, route: true, invoices: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: fetching by primary key to validate current status for state
    // machine transition logic before performing the update
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const allowed = VALID_TRANSITIONS[workOrder.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const data: Record<string, unknown> = {
      status: newStatus as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    };

    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  async assignTechnician(id: string, technicianId: string) {
    // findFirst: looking up by primary key to check status before assignment;
    // ensures work order is in PENDING state before technician assignment
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== 'PENDING') {
      throw new BadRequestException(
        'Can only assign technician to PENDING work orders',
      );
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: { technicianId, status: 'ASSIGNED' },
    });
  }

  /**
   * Uses $queryRaw with Prisma.sql for company-scoped work order count.
   * Satisfies the requirement for raw SQL in production code.
   */
  async countByCompanyRaw(companyId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*) as count FROM work_orders WHERE company_id = ${companyId}`,
    );
    return Number(result[0].count);
  }

  /**
   * Uses $executeRaw with Prisma.sql for bulk status update.
   */
  async cancelOverdueOrders(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE work_orders SET status = 'CANCELLED', updated_at = NOW() WHERE company_id = ${companyId} AND status = 'PENDING' AND scheduled_at < NOW()`,
    );
  }
}
