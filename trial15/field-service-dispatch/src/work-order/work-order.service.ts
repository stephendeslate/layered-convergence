import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.CREATED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.EN_ROUTE],
  [WorkOrderStatus.EN_ROUTE]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED],
  [WorkOrderStatus.ON_HOLD]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [WorkOrderStatus.PAID],
  [WorkOrderStatus.PAID]: [WorkOrderStatus.CLOSED],
  [WorkOrderStatus.CLOSED]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    // Verify customer belongs to company
    // findFirst: scoped by companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${dto.customerId} not found`);
    }

    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        customerId: dto.customerId,
        companyId,
        status: WorkOrderStatus.CREATED,
      },
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: {
        customer: true,
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: scoped by companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        invoices: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return workOrder;
  }

  async assign(id: string, companyId: string, dto: AssignWorkOrderDto) {
    const workOrder = await this.findOne(id, companyId);

    if (workOrder.status !== WorkOrderStatus.CREATED) {
      throw new BadRequestException(
        `Cannot assign work order in status ${workOrder.status}. Must be in CREATED status.`,
      );
    }

    // Verify technician belongs to company
    // findFirst: scoped by companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician with id ${dto.technicianId} not found`);
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        technicianId: dto.technicianId,
        status: WorkOrderStatus.ASSIGNED,
      },
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async transition(id: string, companyId: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findOne(id, companyId);
    const currentStatus = workOrder.status;

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${(allowedTransitions ?? []).join(', ') || 'none'}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === WorkOrderStatus.COMPLETED) {
      updateData['completedAt'] = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async findByTechnician(technicianId: string, companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { technicianId, companyId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: WorkOrderStatus, companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { status, companyId },
      include: {
        customer: true,
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getValidTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
    return VALID_TRANSITIONS[status] ?? [];
  }
}
