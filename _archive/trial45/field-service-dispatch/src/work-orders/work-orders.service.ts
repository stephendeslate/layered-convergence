import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { validateTransition } from './work-order-state-machine';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const status = dto.technicianId
      ? WorkOrderStatus.ASSIGNED
      : WorkOrderStatus.UNASSIGNED;

    const workOrder = await this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        companyId,
        status,
      },
      include: { customer: true, technician: true },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: status,
      },
    });

    return workOrder;
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');
    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { customer: true, technician: true },
    });
  }

  async updateStatus(
    companyId: string,
    id: string,
    dto: UpdateWorkOrderStatusDto,
    changedBy?: string,
  ) {
    const workOrder = await this.findOne(companyId, id);
    validateTransition(workOrder.status, dto.status);

    if (dto.status === WorkOrderStatus.ASSIGNED && !workOrder.technicianId) {
      throw new BadRequestException(
        'Cannot assign work order without a technician. Assign a technician first.',
      );
    }

    const data: any = { status: dto.status };
    if (dto.status === WorkOrderStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data,
      include: { customer: true, technician: true },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: id,
        fromStatus: workOrder.status,
        toStatus: dto.status,
        note: dto.note,
        changedBy,
      },
    });

    return updated;
  }

  async assignTechnician(companyId: string, id: string, technicianId: string) {
    const workOrder = await this.findOne(companyId, id);

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        technicianId,
        status:
          workOrder.status === WorkOrderStatus.UNASSIGNED
            ? WorkOrderStatus.ASSIGNED
            : workOrder.status,
      },
      include: { customer: true, technician: true },
    });

    if (workOrder.status === WorkOrderStatus.UNASSIGNED) {
      await this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: WorkOrderStatus.UNASSIGNED,
          toStatus: WorkOrderStatus.ASSIGNED,
          note: `Assigned to technician ${technicianId}`,
        },
      });
    }

    return updated;
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
