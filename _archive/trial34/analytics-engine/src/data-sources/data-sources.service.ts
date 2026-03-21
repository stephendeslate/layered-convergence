import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.dataSource.findMany({
      where: { organizationId },
      include: { transformations: true },
    });
  }

  async findOne(id: string) {
    const ds = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { transformations: true },
    });
    if (!ds) throw new NotFoundException('Data source not found');
    return ds;
  }

  async create(dto: CreateDataSourceDto, organizationId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        connectionConfig: (dto.connectionConfig ?? {}) as Prisma.InputJsonValue,
        fieldMapping: (dto.fieldMapping ?? {}) as Prisma.InputJsonValue,
        syncSchedule: dto.syncSchedule,
        organizationId,
      },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        connectionConfig: dto.connectionConfig as Prisma.InputJsonValue,
        fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
