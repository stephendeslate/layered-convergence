import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    const dashboard = await this.prisma.dashboard.create({
      data: { ...dto, tenantId, layout: dto.layout ?? [] },
    });
    this.logger.log(`Dashboard created: ${dashboard.id} for tenant ${tenantId}`);
    return dashboard;
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { _count: { select: { widgets: true } } },
    });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string, tenantId: string) {
    return this.prisma.dashboard.update({
      where: { id },
      data: { isPublished: true },
    });
  }
}
