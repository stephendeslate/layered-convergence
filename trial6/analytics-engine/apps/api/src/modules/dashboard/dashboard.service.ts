import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.dashboard.findFirstOrThrow({
      where: { id },
      include: { widgets: true, embedConfigs: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...dto,
        layout: dto.layout ? toJsonField(dto.layout) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
