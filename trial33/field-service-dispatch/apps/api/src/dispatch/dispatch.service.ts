import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';
import type { WorkOrderStatus } from '@field-service-dispatch/shared';

// TRACED: FD-SM-WO-001 — Work order state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED', 'ON_HOLD'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  ON_HOLD: ['ASSIGNED', 'CANCELLED'],
};

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    await this.prisma.setTenantContext(tenantId);
    const workOrders = await this.prisma.workOrder.findMany({
      where: { tenantId },
      include: { technician: true, location: true },
      orderBy: { createdAt: 'desc' },
    });

    // TRACED: FD-REQ-TECH-002 — Uses shared paginate utility
    return paginate(workOrders, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by tenantId for RLS alignment
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      include: { technician: true, location: true, notes: true },
    });

    if (!wo) {
      throw new NotFoundException('Work order not found');
    }

    return wo;
  }

  async transition(id: string, toStatus: WorkOrderStatus, changedBy: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by tenantId for RLS alignment
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });

    if (!wo) {
      throw new NotFoundException('Work order not found');
    }

    const allowed = VALID_TRANSITIONS[wo.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${wo.status} to ${toStatus}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: toStatus,
          startedAt: toStatus === 'IN_PROGRESS' ? new Date() : undefined,
          completedAt: toStatus === 'COMPLETED' ? new Date() : undefined,
        },
      }),
      this.prisma.workOrderTransition.create({
        data: {
          workOrderId: id,
          fromStatus: wo.status,
          toStatus,
          changedBy,
        },
      }),
    ]);

    return updated;
  }
}
