// [TRACED:FD-002] Route tracking PLANNED->IN_PROGRESS->COMPLETED
// [TRACED:FD-019] Route state machine PLANNED->IN_PROGRESS->COMPLETED
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

// [TRACED:BE-005] Route service with state machine
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  // Route: PLANNED -> IN_PROGRESS -> COMPLETED
  private readonly validTransitions: Record<string, string[]> = {
    PLANNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
  };

  async createRoute(technicianId: string, companyId: string, name: string, scheduledAt: Date) {
    return this.prisma.route.create({
      data: { name, technicianId, companyId, scheduledAt, status: "PLANNED" },
    });
  }

  async transitionRoute(routeId: string, newStatus: string) {
    // findFirst justified: looking up route by ID for state transition
    const route = await this.prisma.route.findFirst({
      where: { id: routeId },
    });

    if (!route) {
      throw new BadRequestException("Route not found");
    }

    const allowed = this.validTransitions[route.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition route from ${route.status} to ${newStatus}`
      );
    }

    return this.prisma.route.update({
      where: { id: routeId },
      data: {
        status: newStatus as "PLANNED" | "IN_PROGRESS" | "COMPLETED",
        completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
      },
    });
  }

  async recordGpsEvent(technicianId: string, latitude: number, longitude: number, accuracy?: number) {
    return this.prisma.gpsEvent.create({
      data: { technicianId, latitude, longitude, accuracy, timestamp: new Date() },
    });
  }
}
