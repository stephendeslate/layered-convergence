import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateAssignmentDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');

    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });
    if (!technician) throw new NotFoundException('Technician not found');

    const existingActive = await this.prisma.assignment.findFirst({
      where: { workOrderId: dto.workOrderId, technicianId: dto.technicianId, active: true },
    });
    if (existingActive) {
      throw new BadRequestException('Technician is already assigned to this work order');
    }

    return this.prisma.assignment.create({
      data: {
        workOrderId: dto.workOrderId,
        technicianId: dto.technicianId,
        note: dto.note,
      },
      include: { workOrder: true, technician: true },
    });
  }

  async findByWorkOrder(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');

    return this.prisma.assignment.findMany({
      where: { workOrderId },
      include: { technician: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByTechnician(companyId: string, technicianId: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
    });
    if (!technician) throw new NotFoundException('Technician not found');

    return this.prisma.assignment.findMany({
      where: { technicianId, active: true },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { workOrder: true, technician: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async unassign(companyId: string, id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.workOrder.companyId !== companyId) {
      throw new NotFoundException('Assignment not found');
    }
    if (!assignment.active) {
      throw new BadRequestException('Assignment is already inactive');
    }

    return this.prisma.assignment.update({
      where: { id },
      data: {
        active: false,
        unassignedAt: new Date(),
      },
      include: { workOrder: true, technician: true },
    });
  }

  async findActiveByWorkOrder(workOrderId: string) {
    return this.prisma.assignment.findMany({
      where: { workOrderId, active: true },
      include: { technician: true },
    });
  }
}
