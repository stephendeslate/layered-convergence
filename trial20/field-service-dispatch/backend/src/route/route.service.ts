import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.route.findMany({
      where: { companyId },
      include: {
        technician: {
          select: { user: { select: { email: true } } },
        },
        workOrder: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: {
        technician: {
          include: { user: { select: { email: true } } },
        },
        workOrder: true,
      },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async create(dto: CreateRouteDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        workOrderId: dto.workOrderId,
        distance: dto.distance,
        estimatedMinutes: dto.estimatedMinutes,
        companyId,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return this.prisma.route.delete({ where: { id } });
  }
}
