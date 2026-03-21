import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    this.logger.log(`Creating dashboard "${dto.name}" for tenant ${tenantId}`);
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

  async findOne(id: string) {
    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id },
      include: { widgets: true, embedConfig: true, tenant: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;
    if (dto.layout !== undefined) data.layout = toJsonValue(dto.layout);

    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
