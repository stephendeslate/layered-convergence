import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    // Verify technician belongs to company
    await this.prisma.technician.findUniqueOrThrow({
      where: { id: dto.technicianId, companyId },
    });

    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints ?? [],
      },
    });
  }

  async findByTechnician(technicianId: string, date?: string) {
    return this.prisma.route.findMany({
      where: {
        technicianId,
        ...(date ? { date: new Date(date) } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  async optimize(companyId: string, technicianId: string, date: string) {
    // Verify technician belongs to company
    await this.prisma.technician.findUniqueOrThrow({
      where: { id: technicianId, companyId },
    });

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        status: { in: ['assigned', 'en_route'] },
        scheduledAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { customer: true },
    });

    // Simple nearest-neighbor optimization
    // In production: call OpenRouteService Optimization API
    const waypoints = workOrders.map((wo) => ({
      workOrderId: wo.id,
      lat: wo.customer.lat,
      lng: wo.customer.lng,
      address: wo.customer.address,
    }));

    const optimizedOrder = waypoints.map((_, index) => index);
    const estimatedDuration = waypoints.length * 45; // 45 min average per stop

    const route = await this.prisma.route.upsert({
      where: {
        id: `route_${technicianId}_${date}`,
      },
      create: {
        technicianId,
        date: new Date(date),
        waypoints,
        optimizedOrder,
        estimatedDuration,
        totalDistance: waypoints.length * 8.5, // ~8.5 km avg between stops
      },
      update: {
        waypoints,
        optimizedOrder,
        estimatedDuration,
        totalDistance: waypoints.length * 8.5,
      },
    });

    this.logger.log(
      `Route optimized for technician ${technicianId}: ${waypoints.length} stops, ~${estimatedDuration} min`,
    );

    return route;
  }

  async remove(id: string) {
    return this.prisma.route.delete({ where: { id } });
  }
}
