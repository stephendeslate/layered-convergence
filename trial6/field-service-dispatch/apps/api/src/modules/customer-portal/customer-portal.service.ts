import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CustomerPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrackingStatus(token: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { trackingToken: token },
      include: {
        customer: true,
        technician: {
          select: { id: true, name: true, currentLat: true, currentLng: true },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Calculate ETA based on technician position and customer location
    let estimatedMinutes: number | null = null;
    if (
      workOrder.technician?.currentLat &&
      workOrder.technician?.currentLng &&
      workOrder.status === 'EN_ROUTE'
    ) {
      const dist = Math.sqrt(
        (workOrder.technician.currentLat - workOrder.customer.lat) ** 2 +
          (workOrder.technician.currentLng - workOrder.customer.lng) ** 2,
      );
      estimatedMinutes = Math.round(dist * 111 * 2); // rough km * 2 min/km
    }

    return {
      workOrderId: workOrder.id,
      status: workOrder.status,
      technicianName: workOrder.technician?.name ?? null,
      technicianPosition: workOrder.technician
        ? {
            lat: workOrder.technician.currentLat,
            lng: workOrder.technician.currentLng,
          }
        : null,
      customerAddress: workOrder.customer.address,
      estimatedMinutes,
      statusHistory: workOrder.statusHistory,
    };
  }
}
