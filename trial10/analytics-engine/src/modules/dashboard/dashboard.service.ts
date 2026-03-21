import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: { ...dto, tenantId },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(id: string, tenantId: string, data: Partial<CreateDashboardDto>) {
    return this.prisma.dashboard.update({
      where: { id, tenantId },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.dashboard.delete({ where: { id, tenantId } });
  }

  async publish(id: string, tenantId: string) {
    return this.prisma.dashboard.update({
      where: { id, tenantId },
      data: { isPublished: true },
    });
  }
}
