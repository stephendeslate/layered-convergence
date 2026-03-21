import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { ConfigureDataSourceDto } from './dto/configure-data-source.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    this.logger.log(`Creating ${dto.type} data source "${dto.name}" for tenant ${tenantId}`);
    return this.prisma.dataSource.create({
      data: { ...dto, tenantId },
      include: { config: true },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true, syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async configure(dataSourceId: string, dto: ConfigureDataSourceDto) {
    const data: Record<string, unknown> = {};
    if (dto.connectionConfig !== undefined) data.connectionConfig = toJsonValue(dto.connectionConfig);
    if (dto.fieldMapping !== undefined) data.fieldMapping = toJsonValue(dto.fieldMapping);
    if (dto.transformSteps !== undefined) data.transformSteps = toJsonValue(dto.transformSteps);
    if (dto.syncSchedule !== undefined) data.syncSchedule = dto.syncSchedule;

    return this.prisma.dataSourceConfig.upsert({
      where: { dataSourceId },
      update: data,
      create: { dataSourceId, ...data },
    });
  }

  async remove(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async getWebhookIngestUrl(id: string): Promise<string> {
    const ds = await this.prisma.dataSource.findUniqueOrThrow({ where: { id } });
    return `/api/ingest/${ds.id}`;
  }
}
