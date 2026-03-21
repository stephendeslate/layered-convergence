import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  RawRecord,
  ValidationResult,
} from './connector.interface';

const MOCK_PG_DATA: RawRecord[] = [
  {
    id: 1,
    region: 'US',
    product: 'Plan A',
    revenue: 5000,
    created_at: '2026-03-01',
  },
  {
    id: 2,
    region: 'EU',
    product: 'Plan B',
    revenue: 7500,
    created_at: '2026-03-02',
  },
  {
    id: 3,
    region: 'APAC',
    product: 'Plan A',
    revenue: 3200,
    created_at: '2026-03-03',
  },
  {
    id: 4,
    region: 'US',
    product: 'Plan C',
    revenue: 9800,
    created_at: '2026-03-04',
  },
  {
    id: 5,
    region: 'EU',
    product: 'Plan B',
    revenue: 6100,
    created_at: '2026-03-05',
  },
];

@Injectable()
export class PostgresqlConnector implements Connector {
  private readonly logger = new Logger(PostgresqlConnector.name);

  async testConnection(
    config: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const host = config.host as string | undefined;
    const query = config.query as string | undefined;

    if (!host || !query) {
      return { valid: false, error: 'Host and query are required' };
    }

    // In real mode, we would connect to the external PostgreSQL instance.
    // For now, return mock data (dual-mode per spec).
    this.logger.log(`Test connection to PostgreSQL at ${host} (mock mode)`);

    return { valid: true, sampleData: MOCK_PG_DATA.slice(0, 5) };
  }

  async *extract(
    config: Record<string, unknown>,
    _lastSyncCursor?: string,
  ): AsyncGenerator<RawRecord[]> {
    const host = config.host as string | undefined;
    this.logger.log(
      `Extracting data from PostgreSQL at ${host ?? 'mock'} (mock mode)`,
    );

    // Mock mode: yield all mock data in one batch
    yield [...MOCK_PG_DATA];
  }

  async getSampleData(
    config: Record<string, unknown>,
    limit: number,
  ): Promise<RawRecord[]> {
    const result = await this.testConnection(config);
    return (result.sampleData ?? MOCK_PG_DATA).slice(0, limit);
  }
}
