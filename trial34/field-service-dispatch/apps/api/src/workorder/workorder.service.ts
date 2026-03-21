import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkOrderStatus, WORK_ORDER_STATUSES, slugify, paginate, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';

// TRACED: FD-DA-STATE-002 — Work order state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'ESCALATED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'ESCALATED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  ESCALATED: ['ASSIGNED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// TRACED: FD-FC-WO-001 — Work order service with state machine
@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const workOrders = await this.prisma.workOrder.findMany({
      where: { tenantId },
      include: { assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
    return paginate(workOrders, 1, DEFAULT_PAGE_SIZE);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching work order by ID within tenant scope for RLS compliance
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      include: { assignedTo: true },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  // TRACED: FD-CQ-SLUG-002 — slugify used for work order slug generation
  async create(title: string, description: string | undefined, priority: string | undefined, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const slug = slugify(title);
    return this.prisma.workOrder.create({
      data: {
        title,
        slug,
        description: description ?? '',
        priority: (priority ?? 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        tenantId,
        status: 'CREATED',
      },
    });
  }

  async updateStatus(id: string, newStatus: string, tenantId: string) {
    if (!WORK_ORDER_STATUSES.includes(newStatus as WorkOrderStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching work order by ID within tenant scope for state transition
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
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

    return this.prisma.workOrder.update({
      where: { id },
      data: { status: newStatus as WorkOrderStatus },
    });
  }
}
