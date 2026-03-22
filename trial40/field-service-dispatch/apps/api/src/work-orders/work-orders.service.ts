// TRACED: FD-WO-003 — Work orders service with state machine and select optimization
// TRACED: FD-PERF-005 — Prisma select optimization on list queries
// TRACED: FD-DB-005 — N+1 prevention via eager loading with include
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import {
  paginate,
  generateId,
  sanitizeInput,
  slugify,
  WORK_ORDER_STATUS_TRANSITIONS,
  WorkOrderStatus,
} from '@field-service-dispatch/shared';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateWorkOrderDto) {
    const sanitizedTitle = sanitizeInput(dto.title);
    const sanitizedDesc = dto.description ? sanitizeInput(dto.description) : undefined;
    const refSlug = slugify(sanitizedTitle);

    return this.prisma.workOrder.create({
      data: {
        id: generateId('wo'),
        title: sanitizedTitle,
        description: sanitizedDesc
          ? `${sanitizedDesc} [ref:${refSlug}]`
          : `[ref:${refSlug}]`,
        priority: dto.priority ?? 'MEDIUM',
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'OPEN',
        tenantId,
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { tenantId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { tenantId } }),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scoping by tenantId for multi-tenant row isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      include: { schedules: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(tenantId: string, id: string, dto: UpdateWorkOrderDto) {
    // findFirst: verify tenant ownership before mutation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const data: Record<string, string> = {};
    if (dto.title !== undefined) data.title = sanitizeInput(dto.title);
    if (dto.description !== undefined) data.description = sanitizeInput(dto.description);
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;

    return this.prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    // findFirst: verify tenant ownership before delete
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.workOrder.delete({ where: { id } });
  }

  async updateStatus(tenantId: string, id: string, newStatus: string) {
    // findFirst: tenant-scoped lookup for status transition validation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const allowed = WORK_ORDER_STATUS_TRANSITIONS[workOrder.status as WorkOrderStatus];
    if (!allowed?.includes(newStatus as WorkOrderStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
