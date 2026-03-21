import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    const waypoints = dto.workOrderIds
      ? await this.buildWaypoints(companyId, dto.workOrderIds)
      : [];

    const distance = this.calculateTotalDistance(waypoints);

    return this.prisma.route.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        companyId,
        technicianId: dto.technicianId,
        waypoints: waypoints as any,
        distance,
        estimatedTime: Math.round(distance / 40 * 60),
      },
      include: { technician: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { technician: true },
    });

    if (!route || route.companyId !== companyId) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  private async buildWaypoints(companyId: string, workOrderIds: string[]) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { id: { in: workOrderIds }, companyId },
      include: { customer: true },
    });

    return workOrders
      .filter((wo) => wo.customer?.latitude && wo.customer?.longitude)
      .map((wo) => ({
        workOrderId: wo.id,
        title: wo.title,
        latitude: wo.customer!.latitude,
        longitude: wo.customer!.longitude,
        address: wo.customer!.address,
      }));
  }

  private calculateTotalDistance(waypoints: Array<{ latitude: number | null; longitude: number | null }>): number {
    let total = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
        total += this.haversineDistance(
          prev.latitude, prev.longitude,
          curr.latitude, curr.longitude,
        );
      }
    }
    return Math.round(total * 100) / 100;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
