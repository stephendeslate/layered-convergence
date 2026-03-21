import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto, WaypointDto } from './dto/route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    // If technicianId provided, validate company membership
    if (dto.technicianId) {
      const technician = await this.prisma.technician.findFirst({
        where: { id: dto.technicianId, companyId },
      });
      if (!technician) {
        throw new ForbiddenException('Technician not found or does not belong to your company');
      }
    }

    const waypoints = dto.waypoints ?? [];
    const distance = this.calculateTotalDistance(waypoints);
    const estimatedTime = Math.round((distance / 40) * 60); // 40 km/h average

    return this.prisma.route.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        technicianId: dto.technicianId,
        waypoints: waypoints as unknown as Record<string, unknown>[],
        distance,
        estimatedTime,
        companyId,
      },
      include: { technician: true },
    });
  }

  async findAll(companyId: string) {
    // Always filter by companyId for tenant isolation
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    // findFirst with companyId ensures tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(companyId: string, id: string, dto: UpdateRouteDto) {
    await this.findById(companyId, id);

    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.technicianId !== undefined && { technicianId: dto.technicianId }),
        ...(dto.waypoints !== undefined && {
          waypoints: dto.waypoints as unknown as Record<string, unknown>[],
        }),
        ...(dto.distance !== undefined && { distance: dto.distance }),
        ...(dto.estimatedTime !== undefined && { estimatedTime: dto.estimatedTime }),
      },
      include: { technician: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findById(companyId, id);
    return this.prisma.route.delete({ where: { id } });
  }

  calculateTotalDistance(waypoints: WaypointDto[]): number {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.haversineDistance(
        waypoints[i].latitude,
        waypoints[i].longitude,
        waypoints[i + 1].latitude,
        waypoints[i + 1].longitude,
      );
    }
    return totalDistance;
  }

  haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
