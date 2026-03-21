import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(companyId: string, dto: CreateRouteDto) {
    const technician = await this.prisma.technician.findFirstOrThrow({
      where: { id: dto.technicianId, companyId },
    });

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        id: { in: dto.workOrderIds },
        companyId,
      },
    });

    if (workOrders.length !== dto.workOrderIds.length) {
      throw new BadRequestException('One or more work orders not found in this company');
    }

    const waypoints = workOrders.map((wo, i) => ({
      workOrderId: wo.id,
      lat: wo.lat,
      lng: wo.lng,
      order: i,
    }));

    return this.prisma.route.create({
      data: {
        companyId,
        technicianId: technician.id,
        date: new Date(dto.date),
        waypoints,
        optimizedOrder: workOrders.map((_, i) => i),
        estimatedDuration: dto.estimatedDuration,
        estimatedDistance: dto.estimatedDistance,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    return this.prisma.route.findFirstOrThrow({
      where: { id, companyId },
      include: { technician: true },
    });
  }

  async findByTechnicianAndDate(technicianId: string, companyId: string, date: string) {
    return this.prisma.route.findFirst({
      where: {
        technicianId,
        companyId,
        date: new Date(date),
      },
      include: { technician: true },
    });
  }

  async optimize(id: string, companyId: string) {
    const route = await this.prisma.route.findFirstOrThrow({
      where: { id, companyId },
    });

    const waypoints = route.waypoints as Array<{ workOrderId: string; lat: number; lng: number; order: number }>;

    if (waypoints.length < 2) {
      return route;
    }

    const orsApiKey = this.config.get<string>('ORS_API_KEY');
    if (!orsApiKey) {
      throw new BadRequestException(
        'OpenRouteService API key not configured. Set ORS_API_KEY environment variable.',
      );
    }

    const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

    const response = await fetch('https://api.openrouteservice.org/optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: orsApiKey,
      },
      body: JSON.stringify({
        jobs: waypoints.map((wp, i) => ({
          id: i,
          location: [wp.lng, wp.lat],
        })),
        vehicles: [
          {
            id: 0,
            start: coordinates[0],
            end: coordinates[coordinates.length - 1],
          },
        ],
      }),
    });

    if (!response.ok) {
      this.logger.error(`ORS optimization failed: ${response.status}`);
      throw new BadRequestException('Route optimization failed');
    }

    const result = (await response.json()) as {
      routes?: Array<{
        steps?: Array<{ type: string; job: number }>;
        duration?: number;
        distance?: number;
        geometry?: unknown;
      }>;
    };
    const optimizedOrder = result.routes?.[0]?.steps
      ?.filter((s) => s.type === 'job')
      ?.map((s) => s.job) ?? waypoints.map((_, i) => i);

    const totalDuration = result.routes?.[0]?.duration ?? route.estimatedDuration;
    const totalDistance = result.routes?.[0]?.distance ?? route.estimatedDistance;
    const polyline = result.routes?.[0]?.geometry ?? null;

    return this.prisma.route.update({
      where: { id },
      data: {
        optimizedOrder,
        estimatedDuration: totalDuration ? Math.round(totalDuration / 60) : null,
        estimatedDistance: totalDistance ? Math.round(totalDistance) : null,
        polyline: polyline ? { geometry: polyline } : undefined,
      },
    });
  }
}
