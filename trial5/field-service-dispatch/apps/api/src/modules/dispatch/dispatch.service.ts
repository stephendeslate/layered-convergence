import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TechnicianStatus, WorkOrderStatus } from '@prisma/client';
import { AutoAssignDto } from './dto/auto-assign.dto';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async autoAssign(dto: AutoAssignDto) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: dto.workOrderId },
      include: { customer: true },
    });

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
      throw new Error('Work order is already assigned');
    }

    // Find available technicians in same company with matching skills
    const technicians = await this.prisma.technician.findMany({
      where: {
        companyId: workOrder.companyId,
        status: TechnicianStatus.AVAILABLE,
        ...(dto.requiredSkills && dto.requiredSkills.length > 0
          ? { skills: { hasEvery: dto.requiredSkills } }
          : {}),
      },
    });

    if (technicians.length === 0) {
      return { assigned: false, reason: 'No available technicians with matching skills' };
    }

    // Find nearest technician
    const techWithDistance = technicians
      .filter((t) => t.currentLat != null && t.currentLng != null)
      .map((t) => ({
        ...t,
        distance: this.haversineDistance(
          t.currentLat!, t.currentLng!,
          workOrder.customer.lat, workOrder.customer.lng,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearest = techWithDistance[0] || technicians[0];

    // Assign
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: {
        technicianId: nearest.id,
        status: WorkOrderStatus.ASSIGNED,
      },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: dto.workOrderId,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: WorkOrderStatus.ASSIGNED,
        note: `Auto-assigned to ${nearest.name} (nearest available)`,
      },
    });

    await this.prisma.technician.update({
      where: { id: nearest.id },
      data: { status: TechnicianStatus.BUSY },
    });

    this.logger.log(`Auto-assigned work order ${dto.workOrderId} to technician ${nearest.name}`);

    return {
      assigned: true,
      technicianId: nearest.id,
      technicianName: nearest.name,
      distance: 'distance' in nearest ? (nearest as { distance: number }).distance : null,
    };
  }

  async getDispatchBoard(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });

    const columns: Record<string, typeof workOrders> = {};
    for (const status of Object.values(WorkOrderStatus)) {
      columns[status] = workOrders.filter((wo) => wo.status === status);
    }

    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
    });

    return {
      columns,
      technicians,
      summary: {
        total: workOrders.length,
        unassigned: columns.UNASSIGNED?.length || 0,
        inProgress: (columns.EN_ROUTE?.length || 0) + (columns.ON_SITE?.length || 0) + (columns.IN_PROGRESS?.length || 0),
        completed: (columns.COMPLETED?.length || 0) + (columns.INVOICED?.length || 0) + (columns.PAID?.length || 0),
      },
    };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
