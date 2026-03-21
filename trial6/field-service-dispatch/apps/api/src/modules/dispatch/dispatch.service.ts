import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TechnicianStatus } from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async autoAssign(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId },
      include: { customer: true },
    });

    // Find nearest available technician with matching skills
    const availableTechnicians = await this.prisma.technician.findMany({
      where: {
        companyId: workOrder.companyId,
        status: TechnicianStatus.AVAILABLE,
        currentLat: { not: null },
        currentLng: { not: null },
      },
    });

    if (availableTechnicians.length === 0) {
      throw new NotFoundException('No available technicians found');
    }

    // Find nearest by simple distance
    let nearest = availableTechnicians[0];
    let nearestDist = Infinity;

    for (const tech of availableTechnicians) {
      if (tech.currentLat === null || tech.currentLng === null) continue;
      const dist = Math.sqrt(
        (tech.currentLat - workOrder.customer.lat) ** 2 +
          (tech.currentLng - workOrder.customer.lng) ** 2,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = tech;
      }
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { technicianId: nearest.id, status: 'ASSIGNED' },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId,
        fromStatus: workOrder.status,
        toStatus: 'ASSIGNED',
        note: `Auto-assigned to ${nearest.name}`,
      },
    });

    return { workOrder: updated, assignedTechnician: nearest };
  }

  async getDispatchBoard(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });

    const grouped = {
      UNASSIGNED: workOrders.filter((wo) => wo.status === 'UNASSIGNED'),
      ASSIGNED: workOrders.filter((wo) => wo.status === 'ASSIGNED'),
      EN_ROUTE: workOrders.filter((wo) => wo.status === 'EN_ROUTE'),
      ON_SITE: workOrders.filter((wo) => wo.status === 'ON_SITE'),
      IN_PROGRESS: workOrders.filter((wo) => wo.status === 'IN_PROGRESS'),
      COMPLETED: workOrders.filter((wo) => wo.status === 'COMPLETED'),
    };

    return grouped;
  }
}
