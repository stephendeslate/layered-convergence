import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WorkOrderStatus, TechnicianStatus } from '@prisma/client';
import { fromJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-assign work order to the nearest available technician with matching skills.
   */
  async autoAssign(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId, status: WorkOrderStatus.UNASSIGNED },
      include: { customer: true },
    });

    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: TechnicianStatus.AVAILABLE,
        currentLat: { not: null },
        currentLng: { not: null },
      },
    });

    if (availableTechnicians.length === 0) {
      return { assigned: false, reason: 'No available technicians' };
    }

    // Find nearest technician using Haversine distance
    let nearest = availableTechnicians[0];
    let minDistance = Infinity;

    for (const tech of availableTechnicians) {
      const distance = this.haversineDistance(
        tech.currentLat!,
        tech.currentLng!,
        workOrder.customer.lat,
        workOrder.customer.lng,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = tech;
      }
    }

    // Assign the work order
    await this.prisma.$transaction(async (tx) => {
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          technicianId: nearest.id,
          status: WorkOrderStatus.ASSIGNED,
        },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId,
          fromStatus: WorkOrderStatus.UNASSIGNED,
          toStatus: WorkOrderStatus.ASSIGNED,
          note: `Auto-assigned to ${nearest.name} (${minDistance.toFixed(1)} km away)`,
        },
      });
    });

    this.logger.log(
      `Auto-assigned work order ${workOrderId} to ${nearest.name} (${minDistance.toFixed(1)} km)`,
    );

    return {
      assigned: true,
      technicianId: nearest.id,
      technicianName: nearest.name,
      distanceKm: parseFloat(minDistance.toFixed(1)),
    };
  }

  /**
   * Get dispatch board data — work orders grouped by status.
   */
  async getDispatchBoard(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });

    const board: Record<string, typeof workOrders> = {};
    for (const status of Object.values(WorkOrderStatus)) {
      board[status] = workOrders.filter((wo) => wo.status === status);
    }

    return board;
  }

  /**
   * Get analytics summary for dispatch operations.
   */
  async getAnalytics(companyId: string) {
    const [total, completed, inProgress] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({ where: { companyId, status: WorkOrderStatus.COMPLETED } }),
      this.prisma.workOrder.count({
        where: {
          companyId,
          status: { in: [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ON_SITE, WorkOrderStatus.IN_PROGRESS] },
        },
      }),
    ]);

    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });

    const utilization = technicians.map((tech) => ({
      technicianId: tech.id,
      name: tech.name,
      status: tech.status,
      activeOrders: tech._count.workOrders,
    }));

    return {
      totalWorkOrders: total,
      completedWorkOrders: completed,
      inProgressWorkOrders: inProgress,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
      technicianUtilization: utilization,
    };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
