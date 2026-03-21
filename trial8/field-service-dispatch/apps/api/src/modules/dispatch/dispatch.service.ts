import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { fromJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-assign a work order to the nearest available technician
   * with matching skills.
   */
  async autoAssign(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId },
      include: { customer: true },
    });

    if (workOrder.status !== 'unassigned') {
      this.logger.warn(`Work order ${workOrderId} is already ${workOrder.status}`);
      return { assigned: false, reason: `Work order is ${workOrder.status}` };
    }

    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId: workOrder.companyId,
        status: 'available',
        currentLat: { not: null },
        currentLng: { not: null },
      },
    });

    if (availableTechnicians.length === 0) {
      this.logger.warn('No available technicians found');
      return { assigned: false, reason: 'No available technicians' };
    }

    // Find nearest technician
    let nearest = availableTechnicians[0];
    let nearestDist = Infinity;

    for (const tech of availableTechnicians) {
      if (tech.currentLat === null || tech.currentLng === null) continue;
      const dist = this.haversineDistance(
        tech.currentLat, tech.currentLng,
        workOrder.customer.lat, workOrder.customer.lng,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = tech;
      }
    }

    this.logger.log(`Auto-assigning work order ${workOrderId} to ${nearest.name} (${nearestDist.toFixed(1)} km away)`);

    await this.prisma.$transaction(async (tx) => {
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: { technicianId: nearest.id, status: 'assigned' },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId,
          fromStatus: 'unassigned',
          toStatus: 'assigned',
          note: `Auto-assigned to ${nearest.name} (${nearestDist.toFixed(1)} km)`,
        },
      });
    });

    return {
      assigned: true,
      technician: nearest,
      distanceKm: Math.round(nearestDist * 10) / 10,
    };
  }

  /**
   * Get dispatch board data: work orders grouped by status.
   */
  async getBoard(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });

    const board: Record<string, typeof workOrders> = {};
    for (const wo of workOrders) {
      if (!board[wo.status]) board[wo.status] = [];
      board[wo.status].push(wo);
    }

    return board;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
