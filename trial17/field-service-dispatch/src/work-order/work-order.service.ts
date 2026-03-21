import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: ['CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        companyId,
        status: dto.technicianId ? 'ASSIGNED' : 'CREATED',
      },
      include: { technician: true, customer: true },
    });
  }

  async findAll(companyId: string, status?: WorkOrderStatus) {
    return this.prisma.workOrder.findMany({
      where: { companyId, ...(status && { status }) },
      include: { technician: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: { technician: true, customer: true, invoices: true },
    });

    if (!workOrder || workOrder.companyId !== companyId) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    const workOrder = await this.findOne(companyId, id);

    return this.prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { technician: true, customer: true },
    });
  }

  async transition(companyId: string, id: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findOne(companyId, id);
    const allowed = VALID_TRANSITIONS[workOrder.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const data: any = { status: newStatus };
    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id: workOrder.id },
      data,
      include: { technician: true, customer: true },
    });
  }

  getValidTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
    return VALID_TRANSITIONS[status] || [];
  }
}
