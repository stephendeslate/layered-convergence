import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateGpsPositionDto } from './gps.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Update technician GPS position. In production this would also
   * broadcast via WebSocket gateway to connected dispatch/customer clients.
   */
  async updatePosition(companyId: string, technicianId: string, dto: UpdateGpsPositionDto) {
    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    return this.prisma.technician.update({
      where: { id: technicianId },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
      },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        status: true,
      },
    });
  }

  /**
   * Get all technician positions for a company's live dispatch map.
   */
  async getAllPositions(companyId: string) {
    return this.prisma.technician.findMany({
      where: {
        companyId,
        currentLat: { not: null },
        currentLng: { not: null },
        status: { not: 'OFF_DUTY' },
      },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        status: true,
        skills: true,
      },
    });
  }

  /**
   * Get ETA for a technician en route to a customer.
   * Simple distance-based estimate; production would use routing API.
   */
  async getEta(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId },
      include: { technician: true, customer: true },
    });

    if (!workOrder.technician?.currentLat || !workOrder.customer?.lat) {
      return { etaMinutes: null, message: 'Location data unavailable' };
    }

    // Simple haversine-like distance estimate
    const latDiff = Math.abs(workOrder.technician.currentLat - workOrder.customer.lat);
    const lngDiff = Math.abs(workOrder.technician.currentLng! - workOrder.customer.lng!);
    const distKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough km
    const etaMinutes = Math.round(distKm / 0.5); // ~30 km/h average

    return {
      etaMinutes,
      technicianLocation: {
        lat: workOrder.technician.currentLat,
        lng: workOrder.technician.currentLng,
      },
      customerLocation: {
        lat: workOrder.customer.lat,
        lng: workOrder.customer.lng,
      },
    };
  }
}
