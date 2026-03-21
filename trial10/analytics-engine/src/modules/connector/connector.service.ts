import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Connector service handles data ingestion from external sources.
 * No DTO required — inputs come from internal service calls and DataSourceConfig,
 * not from HTTP request bodies (convention 5.31).
 */
@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute a sync for a given data source using its configured connector type.
   */
  async executeSync(dataSourceId: string): Promise<{
    rowsIngested: number;
    status: string;
  }> {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
      include: { config: true },
    });

    const syncRun = await this.prisma.syncRun.create({
      data: { dataSourceId, status: 'running' },
    });

    try {
      let rowsIngested = 0;

      switch (dataSource.type) {
        case 'api':
          rowsIngested = await this.syncFromApi(dataSource);
          break;
        case 'postgresql':
          rowsIngested = await this.syncFromPostgresql(dataSource);
          break;
        case 'csv':
          rowsIngested = await this.syncFromCsv(dataSource);
          break;
        case 'webhook':
          // Webhooks are push-based; this handles backfill
          rowsIngested = 0;
          break;
        default:
          throw new Error(`Unknown connector type: ${dataSource.type}`);
      }

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'completed', rowsIngested, completedAt: new Date() },
      });

      return { rowsIngested, status: 'completed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Sync failed for ${dataSourceId}: ${errorMessage}`);

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'failed', errorLog: errorMessage, completedAt: new Date() },
      });

      return { rowsIngested: 0, status: 'failed' };
    }
  }

  private async syncFromApi(dataSource: {
    id: string;
    tenantId: string;
    config: { connectionConfig: unknown; fieldMapping: unknown; transformSteps: unknown } | null;
  }): Promise<number> {
    // In production: fetch from configured API endpoint, apply field mapping and transforms
    this.logger.log(`API sync for data source ${dataSource.id}`);
    return 0;
  }

  private async syncFromPostgresql(dataSource: {
    id: string;
    tenantId: string;
    config: { connectionConfig: unknown; fieldMapping: unknown; transformSteps: unknown } | null;
  }): Promise<number> {
    // In production: connect to configured PostgreSQL, execute query, map columns
    this.logger.log(`PostgreSQL sync for data source ${dataSource.id}`);
    return 0;
  }

  private async syncFromCsv(dataSource: {
    id: string;
    tenantId: string;
    config: { connectionConfig: unknown; fieldMapping: unknown; transformSteps: unknown } | null;
  }): Promise<number> {
    // In production: parse CSV from stored file, apply column mapping
    this.logger.log(`CSV sync for data source ${dataSource.id}`);
    return 0;
  }
}
