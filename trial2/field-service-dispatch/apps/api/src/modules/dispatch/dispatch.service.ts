import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderStatus, DispatchBoard, WorkOrderSummary, TechnicianSummary } from '@field-service/shared';

@Injectable()
export class DispatchService {
  constructor(private prisma: PrismaService) {}

  async getBoard(companyId: string): Promise<DispatchBoard> {
    const [workOrders, technicians] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: {
          customer: { select: { name: true } },
          technician: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const woSummaries: WorkOrderSummary[] = workOrders.map((wo) => ({
      id: wo.id,
      title: wo.title,
      status: wo.status as WorkOrderStatus,
      priority: wo.priority as WorkOrderSummary['priority'],
      serviceType: wo.serviceType,
      address: wo.address,
      lat: wo.lat,
      lng: wo.lng,
      scheduledAt: wo.scheduledAt?.toISOString() ?? null,
      customerName: wo.customer.name,
      technicianName: wo.technician?.name ?? null,
    }));

    const techSummaries: TechnicianSummary[] = technicians.map((t) => ({
      id: t.id,
      name: t.name,
      skills: t.skills,
      status: t.status as TechnicianSummary['status'],
      currentLat: t.currentLat,
      currentLng: t.currentLng,
    }));

    const statusCounts = woSummaries.reduce(
      (acc, wo) => {
        const key = wo.status.toLowerCase().replace(/_/g, '') as string;
        if (key === 'unassigned') acc.unassigned++;
        else if (key === 'assigned') acc.assigned++;
        else if (key === 'enroute') acc.enRoute++;
        else if (key === 'onsite') acc.onSite++;
        else if (key === 'inprogress') acc.inProgress++;
        else if (key === 'completed' || key === 'invoiced' || key === 'paid') acc.completed++;
        acc.total++;
        return acc;
      },
      { unassigned: 0, assigned: 0, enRoute: 0, onSite: 0, inProgress: 0, completed: 0, total: 0 },
    );

    return {
      workOrders: woSummaries,
      technicians: techSummaries,
      stats: statusCounts,
    };
  }

  async autoAssign(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId, status: 'UNASSIGNED' },
    });

    const serviceType = workOrder.serviceType;

    const availableTechnicians = await this.prisma.$queryRaw<
      Array<{ id: string; name: string; distance_meters: number }>
    >`
      SELECT
        t.id,
        t.name,
        (
          6371000 * acos(
            cos(radians(${workOrder.lat})) * cos(radians(t."currentLat")) *
            cos(radians(t."currentLng") - radians(${workOrder.lng})) +
            sin(radians(${workOrder.lat})) * sin(radians(t."currentLat"))
          )
        ) as distance_meters
      FROM technicians t
      WHERE t."companyId" = ${companyId}::uuid
        AND t.status = 'AVAILABLE'
        AND t."isActive" = true
        AND t."currentLat" IS NOT NULL
        AND t."currentLng" IS NOT NULL
        AND ${serviceType} = ANY(t.skills)
      ORDER BY distance_meters ASC
      LIMIT 1
    `;

    if (availableTechnicians.length === 0) {
      return { assigned: false, reason: 'No available technicians found' };
    }

    const nearest = availableTechnicians[0]!;

    const updated = await this.prisma.$transaction(async (tx) => {
      const wo = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          technicianId: nearest.id,
          status: 'ASSIGNED',
        },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId,
          companyId,
          fromStatus: 'UNASSIGNED',
          toStatus: 'ASSIGNED',
          note: `Auto-assigned to ${nearest.name} (${Math.round(nearest.distance_meters)}m away)`,
        },
      });

      return wo;
    });

    return {
      assigned: true,
      workOrder: updated,
      technicianId: nearest.id,
      technicianName: nearest.name,
      distanceMeters: Math.round(nearest.distance_meters),
    };
  }
}
