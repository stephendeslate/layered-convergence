import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConnectorConfigDto } from './dto/connector-config.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class ConnectorService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertConfig(dto: ConnectorConfigDto) {
    const existing = await this.prisma.dataSourceConfig.findFirst({
      where: { dataSourceId: dto.dataSourceId },
    }); // [JUSTIFIED:FIND_FIRST] — checking existence before upsert

    if (existing) {
      return this.prisma.dataSourceConfig.update({
        where: { id: existing.id },
        data: {
          connectionConfig: toJsonField(dto.connectionConfig),
          fieldMapping: dto.fieldMapping
            ? toJsonField(dto.fieldMapping)
            : undefined,
          transformSteps: dto.transformSteps
            ? toJsonField(dto.transformSteps)
            : undefined,
          syncSchedule: dto.syncSchedule,
        },
      });
    }

    return this.prisma.dataSourceConfig.create({
      data: {
        dataSourceId: dto.dataSourceId,
        connectionConfig: toJsonField(dto.connectionConfig),
        fieldMapping: dto.fieldMapping
          ? toJsonField(dto.fieldMapping)
          : toJsonField([]),
        transformSteps: dto.transformSteps
          ? toJsonField(dto.transformSteps)
          : toJsonField([]),
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async getConfig(dataSourceId: string) {
    return this.prisma.dataSourceConfig.findFirstOrThrow({
      where: { dataSourceId },
    });
  }

  async removeConfig(dataSourceId: string) {
    const config = await this.prisma.dataSourceConfig.findFirstOrThrow({
      where: { dataSourceId },
    });
    return this.prisma.dataSourceConfig.delete({ where: { id: config.id } });
  }
}
