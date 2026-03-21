import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

/**
 * Valid state transitions for the work order state machine:
 *   unassigned -> assigned
 *   assigned -> en_route | unassigned (reassign)
 *   en_route -> on_site
 *   on_site -> in_progress
 *   in_progress -> completed
 *   completed -> invoiced
 *   invoiced -> paid
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  unassigned: ['assigned'],
  assigned: ['en_route', 'unassigned'],
  en_route: ['on_site'],
  on_site: ['in_progress'],
  in_progress: ['completed'],
  completed: ['invoiced'],
  invoiced: ['paid'],
  // Terminal state: paid — no outgoing transitions
};

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    this.logger.log(`Creating work order: ${dto.title} for company ${companyId}`);

    const status = dto.technicianId ? 'assigned' : 'unassigned';

    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'medium',
        status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { customer: true, technician: true },
    });
  }

  async findAllByCompany(companyId: string, filters?: { status?: string; technicianId?: string }) {
    const where: Record<string, unknown> = { companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.technicianId) where.technicianId = filters.technicianId;

    return this.prisma.workOrder.findMany({
      where,
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  async transition(id: string, toStatus: string, note?: string, technicianId?: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
    });

    const currentStatus = workOrder.status;
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} -> ${toStatus}. ` +
        `Allowed transitions from "${currentStatus}": ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }

    this.logger.log(`Work order ${id}: ${currentStatus} -> ${toStatus}`);

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: currentStatus,
          toStatus,
          note,
        },
      });

      const data: Record<string, unknown> = { status: toStatus };
      if (toStatus === 'assigned' && technicianId) {
        data.technicianId = technicianId;
      }
      if (toStatus === 'completed') {
        data.completedAt = new Date();
      }

      return tx.workOrder.update({
        where: { id },
        data,
        include: { customer: true, technician: true, statusHistory: true },
      });
    });
  }

  async getAnalytics(companyId: string) {
    const [total, byStatus, byPriority] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.workOrder.groupBy({
        by: ['priority'],
        where: { companyId },
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
    };
  }

  async remove(id: string) {
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
