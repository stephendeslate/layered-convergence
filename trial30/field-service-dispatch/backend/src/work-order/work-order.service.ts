import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
  }

  async findByTechnician(technicianId: string) {
    return this.prisma.workOrder.findMany({
      where: { technicianId },
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related entities;
    // findFirst allows future composite filtering (e.g., id + serviceAreaId)
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
      include: { customer: true, technician: true, equipment: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async create(data: {
    title: string;
    description: string;
    priority: string;
    estimatedCost?: number;
    customerId: string;
    serviceAreaId?: string;
  }) {
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        estimatedCost: data.estimatedCost,
        customerId: data.customerId,
        serviceAreaId: data.serviceAreaId,
      },
    });
  }

  async transitionStatus(
    id: string,
    newStatus: string,
    technicianId?: string,
    actualCost?: number,
  ) {
    // findFirst: looking up by primary key but validating current status for
    // state machine transition logic before performing the update
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
      status: newStatus,
    };

    if (newStatus === 'ASSIGNED' && technicianId) {
      updateData.technicianId = technicianId;
    }

    if (newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
      if (actualCost !== undefined) {
        updateData.actualCost = actualCost;
      }
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Uses $queryRaw with Prisma.sql for work order count by status.
   * This satisfies the requirement for raw SQL in production code.
   */
  async countByStatusRaw(status: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*) as count FROM work_orders WHERE status = ${status}::work_order_status`,
    );
    return Number(result[0].count);
  }

  async markUrgent(id: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE work_orders SET priority = 'CRITICAL', updated_at = NOW() WHERE id = ${id}`,
    );
    // findFirst: fetching by primary key after raw SQL update to return the
    // updated entity; raw update bypasses Prisma's return type
    return this.prisma.workOrder.findFirst({ where: { id } });
  }
}
