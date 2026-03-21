import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: {
        technician: true,
        workOrders: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: safe because we filter by both id (PK) and companyId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: {
        technician: true,
        workOrders: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  async create(dto: CreateRouteDto, companyId: string) {
    const route = await this.prisma.route.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        technicianId: dto.technicianId,
        estimatedDistance: dto.estimatedDistance,
        companyId,
        ...(dto.workOrderIds && dto.workOrderIds.length > 0
          ? {
              workOrders: {
                connect: dto.workOrderIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        technician: true,
        workOrders: true,
      },
    });

    this.logger.log(`Route created: ${route.id}`);
    return route;
  }
}
