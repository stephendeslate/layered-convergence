import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  WorkOrderStatus,
  UserRole,
  isValidTransition,
  getTransition,
  canUserTransition,
} from '@field-service/shared';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const trackingToken = randomUUID();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.create({
        data: {
          companyId,
          customerId: dto.customerId,
          title: dto.title,
          description: dto.description,
          serviceType: dto.serviceType,
          priority: dto.priority,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          estimatedDuration: dto.estimatedDuration,
          address: dto.address,
          lat: dto.lat,
          lng: dto.lng,
          notes: dto.notes,
          trackingToken,
        },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: workOrder.id,
          companyId,
          toStatus: 'UNASSIGNED',
          note: 'Work order created',
        },
      });

      return workOrder;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: {
        customer: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true, skills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    return this.prisma.workOrder.findFirstOrThrow({
      where: { id, companyId },
      include: {
        customer: true,
        technician: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        photos: true,
        invoice: true,
      },
    });
  }

  async findByTrackingToken(token: string) {
    return this.prisma.workOrder.findUnique({
      where: { trackingToken: token },
      include: {
        technician: { select: { id: true, name: true, currentLat: true, currentLng: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateWorkOrderDto) {
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async transitionStatus(
    workOrderId: string,
    companyId: string,
    toStatus: WorkOrderStatus,
    userId: string,
    userRole: UserRole,
    note?: string,
  ) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId },
    });

    const currentStatus = workOrder.status as WorkOrderStatus;

    if (!isValidTransition(currentStatus, toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${toStatus}`,
      );
    }

    if (!canUserTransition(currentStatus, toStatus, userRole)) {
      throw new ForbiddenException(
        `Role ${userRole} cannot perform transition from ${currentStatus} to ${toStatus}`,
      );
    }

    const transition = getTransition(currentStatus, toStatus);

    const updated = await this.prisma.$transaction(async (tx) => {
      const wo = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: toStatus,
          ...(toStatus === WorkOrderStatus.COMPLETED && { completedAt: new Date() }),
          ...(toStatus === WorkOrderStatus.IN_PROGRESS && { startedAt: new Date() }),
          ...(toStatus === WorkOrderStatus.UNASSIGNED && { technicianId: null }),
        },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId,
          companyId,
          fromStatus: currentStatus,
          toStatus,
          changedBy: userId,
          note,
        },
      });

      return wo;
    });

    if (transition?.sideEffects) {
      for (const effect of transition.sideEffects) {
        this.logger.log(`Executing side effect: ${effect} for work order ${workOrderId}`);
        this.eventEmitter.emit(`work-order.${effect}`, {
          workOrderId,
          companyId,
          workOrder: updated,
        });
      }
    }

    this.eventEmitter.emit('work-order.status-changed', {
      workOrderId,
      companyId,
      fromStatus: currentStatus,
      toStatus,
    });

    return updated;
  }

  async assign(workOrderId: string, companyId: string, technicianId: string, userId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId },
    });

    const technician = await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    if (workOrder.status !== 'UNASSIGNED') {
      throw new BadRequestException('Work order must be UNASSIGNED to assign');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          technicianId: technician.id,
          status: 'ASSIGNED',
        },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId,
          companyId,
          fromStatus: 'UNASSIGNED',
          toStatus: 'ASSIGNED',
          changedBy: userId,
          note: `Assigned to ${technician.name}`,
        },
      });

      return updated;
    });
  }

  async getHistory(workOrderId: string, companyId: string) {
    return this.prisma.workOrderStatusHistory.findMany({
      where: { workOrderId, companyId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
