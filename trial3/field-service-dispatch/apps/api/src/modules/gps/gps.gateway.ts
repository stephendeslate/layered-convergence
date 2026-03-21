import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GPS Gateway — handles WebSocket-based real-time location updates.
 *
 * In a full NestJS WebSocket implementation, this would use @WebSocketGateway()
 * and @SubscribeMessage(). This service provides the business logic that the
 * gateway delegates to.
 *
 * Protocol:
 * - Technician app sends: { technicianId, lat, lng, timestamp }
 * - Server updates technician location in DB
 * - Server broadcasts to company-scoped room: `company:${companyId}`
 * - Customer tracking page subscribes to: `tracking:${trackingToken}`
 */
@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(technicianId: string, companyId: string, lat: number, lng: number) {
    // Verify technician belongs to company
    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    const updated = await this.prisma.technician.update({
      where: { id: technicianId },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationAt: new Date(),
      },
    });

    return {
      technicianId: updated.id,
      lat: updated.currentLat,
      lng: updated.currentLng,
      lastLocationAt: updated.lastLocationAt,
    };
  }

  async getActiveLocations(companyId: string) {
    const technicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: 'BUSY',
        currentLat: { not: null },
        currentLng: { not: null },
      },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        lastLocationAt: true,
        workOrders: {
          where: { status: { in: ['EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] } },
          select: { id: true, status: true, customer: { select: { name: true, address: true } } },
          take: 1,
        },
      },
    });

    return technicians.map((tech) => ({
      technicianId: tech.id,
      name: tech.name,
      lat: tech.currentLat,
      lng: tech.currentLng,
      lastLocationAt: tech.lastLocationAt,
      activeWorkOrder: tech.workOrders[0] ?? null,
    }));
  }

  async getTrackingLocation(trackingToken: string) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { trackingToken },
      include: {
        technician: {
          select: { currentLat: true, currentLng: true, lastLocationAt: true, name: true },
        },
        customer: { select: { name: true, address: true, lat: true, lng: true } },
        company: { select: { name: true, primaryColor: true, logoUrl: true } },
      },
    });

    return {
      workOrderId: workOrder.id,
      status: workOrder.status,
      technician: workOrder.technician
        ? {
            name: workOrder.technician.name,
            lat: workOrder.technician.currentLat,
            lng: workOrder.technician.currentLng,
            lastLocationAt: workOrder.technician.lastLocationAt,
          }
        : null,
      destination: {
        name: workOrder.customer.name,
        address: workOrder.customer.address,
        lat: workOrder.customer.lat,
        lng: workOrder.customer.lng,
      },
      company: workOrder.company,
    };
  }
}
