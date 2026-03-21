import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DATA_SOURCE_TRANSITIONS } from '../common/constants/transitions';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({ data: dto });
  }

  async findAll(tenantId?: string) {
    return this.prisma.dataSource.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { dataSourceConfig: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id },
      include: { dataSourceConfig: true, syncRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    if (dto.status) {
      const current = await this.prisma.dataSource.findUniqueOrThrow({ where: { id } });
      const allowed = DATA_SOURCE_TRANSITIONS[current.status] || [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from '${current.status}' to '${dto.status}'`,
        );
      }
    }
    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
