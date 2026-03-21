import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from './work-order.dto';

/**
 * Work order state machine:
 *
 *   unassigned  → assigned      (technician assigned)
 *   assigned    → en_route      (technician starts traveling)
 *   en_route    → on_site       (technician arrives)
 *   on_site     → in_progress   (work begins)
 *   in_progress → completed     (work finished)
 *   completed   → invoiced      (invoice generated)
 *   invoiced    → paid          (payment received)
 *
 * Invalid transitions throw BadRequestException because the caller is
 * attempting a state change that is not allowed — this is a client error.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  unassigned: ['assigned'],
  assigned: ['en_route', 'unassigned'],
  en_route: ['on_site'],
  on_site: ['in_progress'],
  in_progress: ['completed'],
  completed: ['invoiced'],
  invoiced: ['paid'],
};

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const status = dto.technicianId ? 'assigned' : 'unassigned';
    const workOrder = await this.prisma.workOrder.create({
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
    });

    await this.recordStatusChange(workOrder.id, 'created', status, 'Work order created');

    if (dto.technicianId) {
      await this.prisma.technician.update({
        where: { id: dto.technicianId },
        data: { status: 'busy' },
      });
    }

    this.logger.log(`Work order created: ${workOrder.id} (${status})`);
    return workOrder;
  }

  async findAllByCompany(companyId: string, status?: string) {
    return this.prisma.workOrder.findMany({
      where: {
        companyId,
        ...(status && { status }),
      },
      include: {
        customer: true,
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async assign(id: string, technicianId: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({ where: { id } });

    if (workOrder.status !== 'unassigned') {
      throw new BadRequestException(
        `Cannot assign work order in '${workOrder.status}' state. Must be 'unassigned'.`,
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { technicianId, status: 'assigned' },
    });

    await this.prisma.technician.update({
      where: { id: technicianId },
      data: { status: 'busy' },
    });

    await this.recordStatusChange(id, 'unassigned', 'assigned', `Assigned to technician ${technicianId}`);
    this.logger.log(`Work order ${id} assigned to technician ${technicianId}`);
    return updated;
  }

  async transition(id: string, toStatus: string, note?: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({ where: { id } });
    const allowed = VALID_TRANSITIONS[workOrder.status] ?? [];

    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${workOrder.status}' to '${toStatus}'. Allowed: [${allowed.join(', ')}]`,
      );
    }

    const data: Record<string, unknown> = { status: toStatus };
    if (toStatus === 'completed') {
      data['completedAt'] = new Date();
    }

    const updated = await this.prisma.workOrder.update({ where: { id }, data });

    // Release technician when work order is completed
    if (toStatus === 'completed' && workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: 'available' },
      });
    }

    await this.recordStatusChange(id, workOrder.status, toStatus, note);
    this.logger.log(`Work order ${id}: ${workOrder.status} → ${toStatus}`);
    return updated;
  }

  async getAnalytics(companyId: string) {
    const [total, unassigned, assigned, inProgress, completed] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'unassigned' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'assigned' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'in_progress' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'completed' } }),
    ]);

    return {
      total,
      byStatus: { unassigned, assigned, inProgress, completed },
    };
  }

  async delete(id: string) {
    return this.prisma.workOrder.delete({ where: { id } });
  }

  private async recordStatusChange(workOrderId: string, fromStatus: string, toStatus: string, note?: string) {
    await this.prisma.workOrderStatusHistory.create({
      data: { workOrderId, fromStatus, toStatus, note },
    });
  }
}
