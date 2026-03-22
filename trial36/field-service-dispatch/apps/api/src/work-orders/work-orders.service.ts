// TRACED: FD-WO-003 — Work orders service with status transitions
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, generateId, sanitizeInput, WORK_ORDER_STATUS_TRANSITIONS, WorkOrderStatus } from '@field-service-dispatch/shared';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, data: { title: string; description?: string; priority?: string; latitude?: string; longitude?: string }) {
    const sanitizedTitle = sanitizeInput(data.title);
    const sanitizedDescription = data.description ? sanitizeInput(data.description) : undefined;

    return this.prisma.workOrder.create({
      data: {
        id: generateId('wo'),
        title: sanitizedTitle,
        description: sanitizedDescription,
        priority: data.priority ?? 'MEDIUM',
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'OPEN',
        tenantId,
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { tenantId } }),
    ]);
    return paginate(items, total, page, pageSize);
  }

  async updateStatus(tenantId: string, id: string, newStatus: string) {
    // findFirst: scoping by tenantId for multi-tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const allowed = WORK_ORDER_STATUS_TRANSITIONS[workOrder.status as WorkOrderStatus];
    if (!allowed?.includes(newStatus as WorkOrderStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
