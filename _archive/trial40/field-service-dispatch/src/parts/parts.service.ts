import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePartDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');

    return this.prisma.part.create({
      data: {
        workOrderId: dto.workOrderId,
        name: dto.name,
        partNumber: dto.partNumber,
        quantity: dto.quantity ?? 1,
        unitCost: dto.unitCost,
      },
    });
  }

  async findByWorkOrder(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');

    return this.prisma.part.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }

  async update(companyId: string, id: string, dto: UpdatePartDto) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!part) throw new NotFoundException('Part not found');
    if (part.workOrder.companyId !== companyId) {
      throw new NotFoundException('Part not found');
    }

    return this.prisma.part.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!part) throw new NotFoundException('Part not found');
    if (part.workOrder.companyId !== companyId) {
      throw new NotFoundException('Part not found');
    }

    return this.prisma.part.delete({ where: { id } });
  }
}
