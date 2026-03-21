import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorService } from '../connector/connector.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorService: ConnectorService,
  ) {}

  async triggerSync(dataSourceId: string) {
    this.logger.log(`Triggering sync for data source: ${dataSourceId}`);
    return this.connectorService.executeSync(dataSourceId);
  }

  async getSyncHistory(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async backfill(dataSourceId: string, startDate: Date, endDate: Date) {
    this.logger.log(
      `Backfill requested for ${dataSourceId}: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );
    return this.connectorService.executeSync(dataSourceId);
  }
}
