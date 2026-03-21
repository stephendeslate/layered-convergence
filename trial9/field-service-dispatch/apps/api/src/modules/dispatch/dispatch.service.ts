import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { TechnicianService } from '../technician/technician.service';
import { WorkOrderService } from '../work-order/work-order.service';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly technicianService: TechnicianService,
    private readonly workOrderService: WorkOrderService,
  ) {}

  /**
   * Auto-assign a work order to the nearest available technician with matching skills.
   * Uses haversine distance to find the closest technician to the customer location.
   */
  async autoAssign(workOrderId: string, requiredSkills?: string[]) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId },
      include: { customer: true },
    });

    if (workOrder.status !== 'unassigned') {
      throw new BadRequestException(
        `Cannot auto-assign work order in '${workOrder.status}' state. Must be 'unassigned'.`,
      );
    }

    const available = await this.technicianService.findAvailable(
      workOrder.companyId,
      requiredSkills,
    );

    if (available.length === 0) {
      throw new BadRequestException('No available technicians with required skills');
    }

    // Find nearest technician to customer
    const customerLat = workOrder.customer.lat;
    const customerLng = workOrder.customer.lng;

    if (customerLat === null || customerLng === null) {
      // If customer has no coordinates, assign the first available technician
      const technician = available[0];
      await this.workOrderService.assign(workOrderId, technician.id);
      return { workOrderId, technicianId: technician.id, method: 'first_available' };
    }

    let nearestId = available[0].id;
    let nearestDist = Infinity;

    for (const tech of available) {
      if (tech.currentLat === null || tech.currentLng === null) continue;
      const dist = this.haversineDistance(customerLat, customerLng, tech.currentLat, tech.currentLng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = tech.id;
      }
    }

    await this.workOrderService.assign(workOrderId, nearestId);
    this.logger.log(`Auto-assigned work order ${workOrderId} to technician ${nearestId} (${nearestDist.toFixed(1)} km)`);
    return { workOrderId, technicianId: nearestId, distance: nearestDist, method: 'nearest' };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
