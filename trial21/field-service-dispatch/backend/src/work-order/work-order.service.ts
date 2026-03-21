import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';

// [TRACED:PV-001] Work order state machine: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> INVOICED, with ON_HOLD
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.ON_HOLD,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.ON_HOLD,
  ],
  [WorkOrderStatus.ON_HOLD]: [
    WorkOrderStatus.ASSIGNED,
    WorkOrderStatus.IN_PROGRESS,
  ],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: {
        customer: { select: { name: true } },
        technician: {
          select: { id: true, user: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: {
          include: { user: { select: { email: true } } },
        },
      },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  async create(dto: CreateWorkOrderDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: dto.technicianId
          ? WorkOrderStatus.ASSIGNED
          : WorkOrderStatus.PENDING,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async transition(
    id: string,
    dto: TransitionWorkOrderDto,
    companyId: string,
  ) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const validNext = VALID_TRANSITIONS[workOrder.status];
    if (!validNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${dto.status}`,
      );
    }

    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === WorkOrderStatus.COMPLETED) {
      data.completedAt = new Date();
    }
    if (
      dto.status === WorkOrderStatus.ASSIGNED &&
      dto.technicianId
    ) {
      data.technicianId = dto.technicianId;
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
