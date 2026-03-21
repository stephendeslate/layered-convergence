import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';

// TRACED:PV-001 Work order state machine
// TRACED:DM-003 WorkOrder status state machine
// TRACED:AC-005 Work order creation sets initial status to OPEN
// TRACED:AC-006 Status transitions validated against state machine
// TRACED:AC-007 Assignment requires technicianId and transitions to ASSIGNED
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  ASSIGNED: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.OPEN, WorkOrderStatus.CANCELLED],
  IN_PROGRESS: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  COMPLETED: [WorkOrderStatus.INVOICED, WorkOrderStatus.CANCELLED],
  INVOICED: [WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED],
  CLOSED: [WorkOrderStatus.CANCELLED],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, status?: WorkOrderStatus) {
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

  async findOne(id: string, companyId: string) {
    // findFirst: safe because we filter by both id (PK) and companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        invoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async create(dto: CreateWorkOrderDto, companyId: string) {
    const workOrder = await this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        customerId: dto.customerId,
        status: WorkOrderStatus.OPEN,
        companyId,
      },
      include: {
        customer: true,
      },
    });

    this.logger.log(`Work order created: ${workOrder.id}`);
    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.scheduledDate !== undefined && {
          scheduledDate: new Date(dto.scheduledDate),
        }),
      },
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, companyId: string) {
    const workOrder = await this.findOne(id, companyId);

    const allowedTransitions = VALID_TRANSITIONS[workOrder.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new ConflictException(
        `Cannot transition from ${workOrder.status} to ${dto.status}`,
      );
    }

    const data: { status: WorkOrderStatus; completedDate?: Date } = {
      status: dto.status,
    };

    if (dto.status === WorkOrderStatus.COMPLETED) {
      data.completedDate = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
      include: {
        customer: true,
        technician: true,
      },
    });
  }

  async assign(id: string, dto: AssignTechnicianDto, companyId: string) {
    const workOrder = await this.findOne(id, companyId);

    if (workOrder.status !== WorkOrderStatus.OPEN) {
      throw new ConflictException(
        `Cannot assign technician when work order status is ${workOrder.status}`,
      );
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
}
