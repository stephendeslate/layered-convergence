import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

interface Waypoint {
  lat: number;
  lng: number;
  label?: string;
}

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    // Verify technician belongs to company
    // findFirst: scoped by companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician with id ${dto.technicianId} not found`);
    }

    const waypoints = dto.waypoints as Waypoint[];
    const distance = this.calculateTotalDistance(waypoints);

    return this.prisma.route.create({
      data: {
        name: dto.name,
        waypoints: dto.waypoints,
        distance,
        technicianId: dto.technicianId,
        companyId,
      },
      include: { technician: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: scoped by companyId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });

    if (!route) {
      throw new NotFoundException(`Route with id ${id} not found`);
    }

    return route;
  }

  async update(id: string, companyId: string, dto: UpdateRouteDto) {
    await this.findOne(id, companyId);

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.waypoints !== undefined) {
      updateData['waypoints'] = dto.waypoints;
      updateData['distance'] = this.calculateTotalDistance(dto.waypoints as Waypoint[]);
    }

    return this.prisma.route.update({
      where: { id },
      data: updateData,
      include: { technician: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.route.delete({
      where: { id },
    });
  }

  async autoAssignNearest(workOrderId: string, companyId: string) {
    // findFirst: scoped by companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: { customer: true },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with id ${workOrderId} not found`);
    }

    if (!workOrder.customer) {
      throw new BadRequestException('Work order has no associated customer');
    }

    const availableTechnicians = await this.prisma.technician.findMany({
      where: { companyId, availability: 'AVAILABLE' },
    });

    if (availableTechnicians.length === 0) {
      throw new BadRequestException('No available technicians');
    }

    const customerLat = workOrder.customer.lat;
    const customerLng = workOrder.customer.lng;

    let nearest = availableTechnicians[0]!;
    let minDistance = this.haversineDistance(
      nearest.lat,
      nearest.lng,
      customerLat,
      customerLng,
    );

    for (let i = 1; i < availableTechnicians.length; i++) {
      const tech = availableTechnicians[i]!;
      const dist = this.haversineDistance(tech.lat, tech.lng, customerLat, customerLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = tech;
      }
    }

    return {
      technician: nearest,
      distance: minDistance,
      workOrderId,
    };
  }

  haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private calculateTotalDistance(waypoints: Waypoint[]): number {
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      total += this.haversineDistance(
        waypoints[i]!.lat,
        waypoints[i]!.lng,
        waypoints[i + 1]!.lat,
        waypoints[i + 1]!.lng,
      );
    }
    return total;
  }
}
