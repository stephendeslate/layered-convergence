import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// [PUBLIC_ENDPOINT] Customer tracking portal — no auth required
@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrackingData(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId },
      include: {
        customer: true,
        technician: {
          select: {
            id: true,
            name: true,
            currentLat: true,
            currentLng: true,
            status: true,
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        company: { select: { name: true, primaryColor: true, logoUrl: true } },
      },
    });

    // Calculate ETA based on distance
    let etaMinutes: number | null = null;
    if (
      workOrder.technician &&
      workOrder.technician.currentLat &&
      workOrder.technician.currentLng &&
      workOrder.status === 'EN_ROUTE'
    ) {
      const distance = this.haversineDistance(
        workOrder.technician.currentLat,
        workOrder.technician.currentLng,
        workOrder.customer.lat,
        workOrder.customer.lng,
      );
      // Assume 40 km/h average speed
      etaMinutes = Math.round((distance / 40) * 60);
    }

    return {
      workOrder: {
        id: workOrder.id,
        title: workOrder.title,
        status: workOrder.status,
        scheduledAt: workOrder.scheduledAt,
      },
      customer: {
        name: workOrder.customer.name,
        address: workOrder.customer.address,
        lat: workOrder.customer.lat,
        lng: workOrder.customer.lng,
      },
      technician: workOrder.technician
        ? {
            name: workOrder.technician.name,
            lat: workOrder.technician.currentLat,
            lng: workOrder.technician.currentLng,
            status: workOrder.technician.status,
          }
        : null,
      eta: etaMinutes,
      timeline: workOrder.statusHistory,
      branding: workOrder.company,
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
