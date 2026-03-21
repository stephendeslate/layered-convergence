import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({ data: dto });
  }

  async findAll(tenantId?: string) {
    return this.prisma.dashboard.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { widgets: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async publish(id: string) {
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
