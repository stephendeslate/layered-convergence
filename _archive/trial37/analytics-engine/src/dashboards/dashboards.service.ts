import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        layout: dto.layout ?? null,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async findById(id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true, embedConfig: true },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
