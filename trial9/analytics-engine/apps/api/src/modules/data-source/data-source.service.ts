import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    const webhookSecret = dto.type === 'webhook'
      ? `whsec_${randomBytes(24).toString('hex')}`
      : undefined;

    const dataSource = await this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        connectionConfig: dto.connectionConfig ?? {},
        fieldMapping: dto.fieldMapping ?? [],
        transformSteps: dto.transformSteps ?? [],
        syncSchedule: dto.syncSchedule,
        webhookSecret,
      },
    });
    this.logger.log(`DataSource created: ${dataSource.id} (${dataSource.type}) for tenant ${tenantId}`);
    return dataSource;
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { _count: { select: { dataPoints: true, syncRuns: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id },
      include: { syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    return this.prisma.dataSource.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
