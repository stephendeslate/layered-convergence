import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: dto,
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async findById(id: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id },
      include: { widgets: true, embedConfig: true, tenant: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    await this.prisma.dashboard.findUniqueOrThrow({ where: { id } });
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async publish(id: string) {
    await this.prisma.dashboard.findUniqueOrThrow({ where: { id } });
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async delete(id: string) {
    await this.prisma.dashboard.findUniqueOrThrow({ where: { id } });
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
