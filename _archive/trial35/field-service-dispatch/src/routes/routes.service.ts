import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints,
        optimizedOrder: dto.optimizedOrder ?? [],
        estimatedDuration: dto.estimatedDuration,
      },
      include: { technician: true },
    });
  }

  async findByTechnician(technicianId: string, date?: string) {
    const where: any = { technicianId };
    if (date) {
      where.date = new Date(date);
    }
    return this.prisma.route.findMany({
      where,
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { technician: true },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.route.delete({ where: { id } });
  }
}
