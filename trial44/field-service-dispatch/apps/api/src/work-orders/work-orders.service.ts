// TRACED: FD-WORK-ORDERS-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams } from '@field-service-dispatch/shared';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: dto,
      include: { technician: true },
    });
  }

  async findAll(page?: number, pageSize?: number, tenantId?: string) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const where = tenantId ? { tenantId } : {};

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        include: { technician: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  }

  async findOne(id: string) {
    // findFirst justification: lookup by primary key with includes
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id },
      include: { technician: true, schedules: true },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(id);
    return this.prisma.workOrder.update({
      where: { id },
      data: dto,
      include: { technician: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workOrder.delete({ where: { id } });
  }
}
