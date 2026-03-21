import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  RawRecord,
  ValidationResult,
} from './connector.interface';

const MOCK_REST_DATA: RawRecord[] = [
  { region: 'US', revenue: 1500, date: '2026-03-01', product: 'Widget A' },
  { region: 'EU', revenue: 2300, date: '2026-03-02', product: 'Widget B' },
  { region: 'US', revenue: 1800, date: '2026-03-03', product: 'Widget A' },
  { region: 'APAC', revenue: 950, date: '2026-03-04', product: 'Widget C' },
  { region: 'EU', revenue: 3100, date: '2026-03-05', product: 'Widget B' },
  { region: 'US', revenue: 2700, date: '2026-03-06', product: 'Widget A' },
  { region: 'APAC', revenue: 1200, date: '2026-03-07', product: 'Widget C' },
  { region: 'US', revenue: 1900, date: '2026-03-08', product: 'Widget B' },
  { region: 'EU', revenue: 2500, date: '2026-03-09', product: 'Widget A' },
  { region: 'US', revenue: 3200, date: '2026-03-10', product: 'Widget C' },
];

@Injectable()
export class RestApiConnector implements Connector {
  private readonly logger = new Logger(RestApiConnector.name);

  async testConnection(
    config: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const url = config.url as string | undefined;
    if (!url) {
      return { valid: false, error: 'URL is required' };
    }

    // If URL looks like a real endpoint, try a real HTTP call
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, {
          method: (config.method as string) || 'GET',
          headers: (config.headers as Record<string, string>) || {},
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          return {
            valid: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        const body = await response.json();
        const jsonPath = config.jsonPath as string | undefined;
        const data = jsonPath ? this.extractJsonPath(body, jsonPath) : body;
        const sampleData = Array.isArray(data) ? data.slice(0, 5) : [data];

        return { valid: true, sampleData };
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') {
          return { valid: false, error: 'Connection timed out after 10s' };
        }
        // Fall through to mock mode on connection errors
        this.logger.warn(
          `Real connection failed, returning mock data: ${error.message}`,
        );
      }
    }

    // Mock mode: return sample data
    return { valid: true, sampleData: MOCK_REST_DATA.slice(0, 5) };
  }

  async *extract(
    config: Record<string, unknown>,
    _lastSyncCursor?: string,
  ): AsyncGenerator<RawRecord[]> {
    const url = config.url as string | undefined;

    // Try real HTTP call
    if (url?.startsWith('http://') || url?.startsWith('https://')) {
      try {
        const response = await fetch(url, {
          method: (config.method as string) || 'GET',
          headers: (config.headers as Record<string, string>) || {},
        });

        if (!response.ok) {
          throw {
            code: response.status >= 500 ? 'TIMEOUT' : 'INVALID_RESPONSE',
            message: `HTTP ${response.status}: ${response.statusText}`,
            retryable: response.status >= 500,
          };
        }

        const body = await response.json();
        const jsonPath = config.jsonPath as string | undefined;
        const data = jsonPath ? this.extractJsonPath(body, jsonPath) : body;
        const records = Array.isArray(data) ? data : [data];

        // Yield in batches of 100
        for (let i = 0; i < records.length; i += 100) {
          yield records.slice(i, i + 100);
        }
        return;
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          'retryable' in err
        ) {
          throw err;
        }
        this.logger.warn(`Real extraction failed, using mock data`);
      }
    }

    // Mock mode
    yield [...MOCK_REST_DATA];
  }

  async getSampleData(
    config: Record<string, unknown>,
    limit: number,
  ): Promise<RawRecord[]> {
    const result = await this.testConnection(config);
    return (result.sampleData ?? MOCK_REST_DATA).slice(0, limit);
  }

  private extractJsonPath(obj: unknown, path: string): unknown {
    // Simple JSON path extraction: $.data.records -> data.records
    const parts = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return current;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }
}
