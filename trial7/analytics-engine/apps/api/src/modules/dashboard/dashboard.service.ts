import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async findOneOrThrow(tenantId: string, id: string) {
    return this.prisma.dashboard.findFirstOrThrow({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        layout: dto.layout ? toJsonField(dto.layout) : undefined,
        isPublished: dto.isPublished,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.dashboard.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
