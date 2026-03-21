import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  FetchResult,
  PostgresqlConnectionConfig,
} from '@analytics-engine/shared';
import { decrypt } from '../common/encryption';
import { Client } from 'pg';

@Injectable()
export class PostgresqlConnector implements Connector {
  private readonly logger = new Logger(PostgresqlConnector.name);

  async validate(config: Record<string, unknown>): Promise<boolean> {
    const c = config as unknown as PostgresqlConnectionConfig;
    if (!c.connectionString || typeof c.connectionString !== 'string') return false;
    if (!c.query || typeof c.query !== 'string') return false;
    return true;
  }

  async fetch(config: Record<string, unknown>): Promise<FetchResult> {
    const c = config as unknown as PostgresqlConnectionConfig;

    let connectionString = c.connectionString;
    try {
      connectionString = decrypt(connectionString);
    } catch {
      // If decryption fails, assume it's plaintext (for development)
    }

    const client = new Client({ connectionString });

    try {
      await client.connect();

      const result = await client.query(c.query, c.params);
      const data = result.rows as Record<string, unknown>[];

      this.logger.debug(`Fetched ${data.length} records from external PostgreSQL`);

      return {
        data,
        metadata: { totalRows: data.length, hasMore: false },
      };
    } finally {
      await client.end();
    }
  }
}
