import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints ? toJsonField(dto.waypoints) : undefined,
        estimatedDuration: dto.estimatedDuration,
      },
    });
  }

  async findByTechnician(technicianId: string) {
    return this.prisma.route.findMany({
      where: { technicianId },
      orderBy: { date: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.route.findFirstOrThrow({
      where: { id },
      include: { technician: true },
    });
  }

  async optimize(id: string) {
    const route = await this.prisma.route.findFirstOrThrow({
      where: { id },
    });

    // In production, this would call OpenRouteService Optimization API
    // For now, return the waypoints in their current order as "optimized"
    const optimizedOrder = Array.from(
      { length: (route.waypoints as unknown[]).length },
      (_, i) => i,
    );

    return this.prisma.route.update({
      where: { id },
      data: { optimizedOrder: toJsonField(optimizedOrder) },
    });
  }

  async remove(id: string) {
    await this.prisma.route.findFirstOrThrow({ where: { id } });
    return this.prisma.route.delete({ where: { id } });
  }
}
