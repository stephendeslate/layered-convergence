import { Injectable } from '@nestjs/common';
import { Prisma, WorkOrder } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<WorkOrder[]> {
    return this.prisma.workOrder.findMany({
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async findById(id: string): Promise<WorkOrder | null> {
    return this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
        route: true,
        invoice: true,
      },
    });
  }

  async assignTechnician(
    workOrderId: string,
    technicianId: string,
  ): Promise<void> {
    // Use $executeRaw with Prisma.sql tagged template for safe parameterized query
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE work_orders SET status = 'ASSIGNED', technician_id = ${technicianId}, updated_at = NOW() WHERE id = ${workOrderId} AND status = 'PENDING'`,
    );
  }

  async completeWorkOrder(workOrderId: string): Promise<void> {
    // Atomic status transition using $executeRaw with Prisma.sql
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE work_orders SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = ${workOrderId} AND status = 'IN_PROGRESS'`,
    );
  }

  async countByStatus(): Promise<{ status: string; count: bigint }[]> {
    const results = await this.prisma.$queryRaw<
      { status: string; count: bigint }[]
    >(
      Prisma.sql`SELECT status, COUNT(*) as count FROM work_orders GROUP BY status`,
    );
    return results;
  }

  async sumEstimatedCosts(): Promise<{ total: string }[]> {
    const results = await this.prisma.$queryRaw<{ total: string }[]>(
      Prisma.sql`SELECT COALESCE(SUM(estimated_cost), 0) as total FROM work_orders`,
    );
    return results;
  }
}
