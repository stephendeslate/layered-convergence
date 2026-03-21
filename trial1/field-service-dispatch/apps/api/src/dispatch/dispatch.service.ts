import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkOrderService } from '../work-order/work-order.service';
import { RoutingService } from '../routing/routing.service';
import { WorkOrderStatus } from '@fsd/shared';

// Auto-assign scoring weights
const WEIGHT_DISTANCE = 0.45;
const WEIGHT_WORKLOAD = 0.30;
const WEIGHT_PRIORITY = 0.10;
const WEIGHT_SKILL = 0.15;
const MINIMUM_SCORE_THRESHOLD = 0.2;
const MAX_DISTANCE_KM = 50;

const PRIORITY_SCORES: Record<string, number> = {
  URGENT: 1.0,
  HIGH: 0.75,
  NORMAL: 0.5,
  LOW: 0.25,
};

export interface AutoAssignResult {
  assignments: Array<{
    workOrderId: string;
    technicianId: string;
    technicianName: string;
    score: number;
    distanceKm: number;
    warnings: string[];
  }>;
  unassigned: Array<{
    workOrderId: string;
    reason: string;
  }>;
  summary: {
    totalProcessed: number;
    assigned: number;
    unassigned: number;
  };
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly workOrderService: WorkOrderService,
    private readonly routing: RoutingService,
  ) {}

  /**
   * Auto-assign unassigned work orders to nearest available technicians.
   */
  async autoAssign(
    companyId: string,
    options: {
      date: string;
      workOrderIds?: string[];
      technicianIds?: string[];
      dryRun?: boolean;
    },
    userId?: string,
  ): Promise<AutoAssignResult> {
    const date = options.date;
    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    // Get unassigned work orders for the date
    const woWhere: any = {
      companyId,
      status: WorkOrderStatus.UNASSIGNED,
      scheduledStart: { gte: dayStart, lte: dayEnd },
    };
    if (options.workOrderIds?.length) {
      woWhere.id = { in: options.workOrderIds };
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where: woWhere,
      orderBy: [
        { priority: 'desc' },
        { scheduledStart: 'asc' },
      ],
    });

    // Get available technicians
    const techWhere: any = {
      companyId,
      status: { in: ['AVAILABLE', 'ON_BREAK'] },
      currentLatitude: { not: null },
      currentLongitude: { not: null },
    };
    if (options.technicianIds?.length) {
      techWhere.id = { in: options.technicianIds };
    }

    const technicians = await this.prisma.technician.findMany({
      where: techWhere,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    // Track active job counts per technician for this date
    const jobCounts = new Map<string, number>();
    for (const tech of technicians) {
      const count = await this.prisma.workOrder.count({
        where: {
          technicianId: tech.id,
          scheduledStart: { gte: dayStart, lte: dayEnd },
          status: { notIn: ['CANCELLED'] },
        },
      });
      jobCounts.set(tech.id, count);
    }

    const assignments: AutoAssignResult['assignments'] = [];
    const unassigned: AutoAssignResult['unassigned'] = [];

    for (const wo of workOrders) {
      // Filter technicians with matching skills
      const eligible = technicians.filter((tech) => {
        const skills = tech.skills as string[];
        return skills.includes(wo.serviceType);
      });

      if (eligible.length === 0) {
        unassigned.push({
          workOrderId: wo.id,
          reason: `No technicians with matching skill: ${wo.serviceType}`,
        });
        continue;
      }

      // Filter by capacity
      const available = eligible.filter((tech) => {
        const count = jobCounts.get(tech.id) ?? 0;
        return count < tech.maxJobsPerDay;
      });

      if (available.length === 0) {
        unassigned.push({
          workOrderId: wo.id,
          reason: 'All matching technicians are at capacity',
        });
        continue;
      }

      // Score each technician
      let bestTech: typeof available[0] | null = null;
      let bestScore = -1;
      let bestDistance = 0;
      const warnings: string[] = [];

      for (const tech of available) {
        const distanceMeters = haversineDistance(
          Number(wo.latitude),
          Number(wo.longitude),
          Number(tech.currentLatitude),
          Number(tech.currentLongitude),
        );
        const distanceKm = distanceMeters / 1000;

        const distanceScore = Math.max(0, 1 - distanceKm / MAX_DISTANCE_KM);
        const activeCount = jobCounts.get(tech.id) ?? 0;
        const workloadScore = 1 - activeCount / tech.maxJobsPerDay;
        const priorityScore = PRIORITY_SCORES[wo.priority] ?? 0.5;

        const techSkills = tech.skills as string[];
        const skillMatchScore = techSkills.includes(wo.serviceType) ? 1.0 : 0;

        const score =
          WEIGHT_DISTANCE * distanceScore +
          WEIGHT_WORKLOAD * workloadScore +
          WEIGHT_PRIORITY * priorityScore +
          WEIGHT_SKILL * skillMatchScore;

        if (score > bestScore) {
          bestScore = score;
          bestTech = tech;
          bestDistance = distanceKm;
        }
      }

      if (!bestTech || bestScore < MINIMUM_SCORE_THRESHOLD) {
        unassigned.push({
          workOrderId: wo.id,
          reason: `Best score (${bestScore.toFixed(2)}) below threshold (${MINIMUM_SCORE_THRESHOLD})`,
        });
        continue;
      }

      // Execute assignment (unless dry run)
      if (!options.dryRun) {
        await this.workOrderService.assign(
          companyId,
          wo.id,
          bestTech.id,
          userId,
        );
      }

      // Update job count
      jobCounts.set(bestTech.id, (jobCounts.get(bestTech.id) ?? 0) + 1);

      assignments.push({
        workOrderId: wo.id,
        technicianId: bestTech.id,
        technicianName: `${bestTech.user.firstName} ${bestTech.user.lastName}`,
        score: Math.round(bestScore * 100) / 100,
        distanceKm: Math.round(bestDistance * 10) / 10,
        warnings,
      });
    }

    if (!options.dryRun && assignments.length > 0) {
      await this.audit.logDispatchAction(
        companyId,
        userId ?? 'system',
        'auto_assign',
        'WorkOrder',
        'batch',
        {
          date,
          assigned: assignments.length,
          unassigned: unassigned.length,
        },
      );
    }

    return {
      assignments,
      unassigned,
      summary: {
        totalProcessed: workOrders.length,
        assigned: assignments.length,
        unassigned: unassigned.length,
      },
    };
  }

  /**
   * Optimize routes for all technicians on a given day.
   */
  async optimizeRoutes(
    companyId: string,
    date: string,
    technicianId?: string,
    userId?: string,
  ) {
    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    // Get technicians with assigned work orders
    const techWhere: any = { companyId };
    if (technicianId) techWhere.id = technicianId;

    const technicians = await this.prisma.technician.findMany({
      where: techWhere,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    const results = [];

    for (const tech of technicians) {
      const workOrders = await this.prisma.workOrder.findMany({
        where: {
          companyId,
          technicianId: tech.id,
          scheduledStart: { gte: dayStart, lte: dayEnd },
          status: { in: ['ASSIGNED', 'EN_ROUTE'] },
        },
        orderBy: { scheduledStart: 'asc' },
      });

      if (workOrders.length < 2) {
        // No optimization needed for fewer than 2 stops
        continue;
      }

      // Build optimization request
      const jobs = workOrders.map((wo) => ({
        id: wo.id,
        location: [Number(wo.longitude), Number(wo.latitude)] as [number, number],
        service: wo.estimatedMinutes * 60,
      }));

      const startLocation: [number, number] = tech.currentLatitude && tech.currentLongitude
        ? [Number(tech.currentLongitude), Number(tech.currentLatitude)]
        : jobs[0].location;

      const vehicles = [
        {
          id: tech.id,
          start: startLocation,
          end: startLocation,
        },
      ];

      const optimizationResult = await this.routing.optimizeRoute(jobs, vehicles);

      if (optimizationResult.routes.length > 0) {
        const route = optimizationResult.routes[0];

        // Upsert Route record
        const dateObj = new Date(`${date}T00:00:00Z`);
        const routeRecord = await this.prisma.route.upsert({
          where: {
            technicianId_date: {
              technicianId: tech.id,
              date: dateObj,
            },
          },
          update: {
            optimized: true,
            totalDistanceMeters: route.distanceMeters,
            totalDurationSeconds: route.durationSeconds,
            geometryJson: route.geometry ? JSON.stringify(route.geometry) : null,
          },
          create: {
            companyId,
            technicianId: tech.id,
            date: dateObj,
            optimized: true,
            totalDistanceMeters: route.distanceMeters,
            totalDurationSeconds: route.durationSeconds,
            geometryJson: route.geometry ? JSON.stringify(route.geometry) : null,
          },
        });

        // Delete old route stops
        await this.prisma.routeStop.deleteMany({
          where: { routeId: routeRecord.id },
        });

        // Create new route stops in optimized order
        const jobSteps = route.steps.filter((s) => s.type === 'job');
        for (let i = 0; i < jobSteps.length; i++) {
          const step = jobSteps[i];
          await this.prisma.routeStop.create({
            data: {
              companyId,
              routeId: routeRecord.id,
              workOrderId: step.jobId!,
              sortOrder: i,
              estimatedArrival: step.arrival
                ? new Date(step.arrival * 1000)
                : null,
              distanceFromPrevMeters: step.distanceMeters,
              durationFromPrevSeconds: step.duration,
            },
          });
        }

        results.push({
          technicianId: tech.id,
          technicianName: `${tech.user.firstName} ${tech.user.lastName}`,
          routeId: routeRecord.id,
          stopCount: jobSteps.length,
          totalDistanceMeters: route.distanceMeters,
          totalDurationSeconds: route.durationSeconds,
        });
      }
    }

    if (userId) {
      await this.audit.logDispatchAction(
        companyId,
        userId,
        'optimize_routes',
        'Route',
        'batch',
        { date, optimizedCount: results.length },
      );
    }

    return {
      date,
      optimized: results,
    };
  }

  /**
   * Get dispatch board data — work orders grouped by status.
   */
  async getDispatchBoard(companyId: string, date?: string) {
    const dayStart = date
      ? new Date(`${date}T00:00:00Z`)
      : new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
      },
      include: {
        customer: true,
        technician: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { scheduledStart: 'asc' }],
    });

    // Group by status
    const columns: Record<string, typeof workOrders> = {
      UNASSIGNED: [],
      ASSIGNED: [],
      EN_ROUTE: [],
      ON_SITE: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };

    for (const wo of workOrders) {
      if (columns[wo.status]) {
        columns[wo.status].push(wo);
      }
    }

    // Get technicians with their status
    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
      },
    });

    // Compute stats
    const stats = {
      total: workOrders.length,
      unassigned: columns.UNASSIGNED.length,
      assigned: columns.ASSIGNED.length,
      enRoute: columns.EN_ROUTE.length,
      onSite: columns.ON_SITE.length,
      inProgress: columns.IN_PROGRESS.length,
      completed: columns.COMPLETED.length,
      cancelled: workOrders.filter((wo) => wo.status === 'CANCELLED').length,
    };

    return {
      date: dayStart.toISOString().split('T')[0],
      columns,
      technicians: technicians.map((t) => ({
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        status: t.status,
        latitude: t.currentLatitude ? Number(t.currentLatitude) : null,
        longitude: t.currentLongitude ? Number(t.currentLongitude) : null,
        jobCount: workOrders.filter(
          (wo) => wo.technicianId === t.id && wo.status !== 'CANCELLED',
        ).length,
      })),
      stats,
    };
  }
}

// Haversine distance in meters
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
