import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
   * Auto-dispatch: find the nearest available technician with matching skills
   * and assign the work order to them.
   */
  async autoDispatch(companyId: string, workOrderId: string, requiredSkills?: string[]) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId, companyId },
      include: { customer: true },
    });

    if (workOrder.status !== 'unassigned') {
      throw new BadRequestException('Work order must be unassigned for auto-dispatch');
    }

    const availableTechnicians = await this.technicianService.findAvailable(
      companyId,
      requiredSkills,
    );

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians with required skills');
    }

    // Find nearest technician using Haversine distance
    const customerLat = workOrder.customer.lat;
    const customerLng = workOrder.customer.lng;

    let nearestTechnician = availableTechnicians[0];
    let minDistance = Infinity;

    for (const tech of availableTechnicians) {
      if (tech.currentLat === null || tech.currentLng === null) continue;

      const distance = this.haversineDistance(
        customerLat,
        customerLng,
        tech.currentLat,
        tech.currentLng,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestTechnician = tech;
      }
    }

    this.logger.log(
      `Auto-dispatching work order ${workOrderId} to technician ${nearestTechnician.id} (${minDistance.toFixed(2)} km)`,
    );

    return this.workOrderService.assign(workOrderId, companyId, nearestTechnician.id);
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula.
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
