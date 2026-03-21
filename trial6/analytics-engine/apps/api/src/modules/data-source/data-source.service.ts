import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({ data: dto });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true, syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.dataSource.findFirstOrThrow({
      where: { id },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    return this.prisma.dataSource.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
