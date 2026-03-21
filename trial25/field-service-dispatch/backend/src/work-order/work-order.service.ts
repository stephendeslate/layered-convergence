// [TRACED:SA-002] WorkOrder state machine: CREATED -> ASSIGNED -> IN_PROGRESS -> COMPLETED | CANCELLED
// [TRACED:API-003] WorkOrder CRUD with company-scoped access
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { WorkOrderStatus } from '@prisma/client';

const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  CREATED: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  ASSIGNED: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  IN_PROGRESS: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    // findFirst used because we filter by both id and companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, invoices: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async create(
    data: {
      title: string;
      description: string;
      priority?: number;
      scheduledAt?: Date;
      customerId: string;
      technicianId?: string;
    },
    userId: string,
    companyId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const workOrder = await this.prisma.workOrder.create({
      data: {
        ...data,
        companyId,
      },
    });

    this.logger.log(`Work order created: ${workOrder.id}`);
    return workOrder;
  }

  async updateStatus(
    id: string,
    newStatus: WorkOrderStatus,
    userId: string,
    companyId: string,
  ) {
    const workOrder = await this.findOne(id, userId, companyId);
    const allowed = validTransitions[workOrder.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt:
          newStatus === WorkOrderStatus.COMPLETED ? new Date() : undefined,
      },
    });

    this.logger.log(
      `Work order ${id} transitioned: ${workOrder.status} -> ${newStatus}`,
    );
    return updated;
  }
}
