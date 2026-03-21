import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  FetchResult,
  RestApiConnectionConfig,
} from '@analytics-engine/shared';

@Injectable()
export class RestApiConnector implements Connector {
  private readonly logger = new Logger(RestApiConnector.name);

  async validate(config: Record<string, unknown>): Promise<boolean> {
    const c = config as unknown as RestApiConnectionConfig;
    if (!c.url || typeof c.url !== 'string') return false;
    if (!c.method || !['GET', 'POST'].includes(c.method)) return false;
    try {
      new URL(c.url);
      return true;
    } catch {
      return false;
    }
  }

  async fetch(config: Record<string, unknown>): Promise<FetchResult> {
    const c = config as unknown as RestApiConnectionConfig;
    const url = new URL(c.url);

    if (c.queryParams) {
      for (const [key, value] of Object.entries(c.queryParams)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(c.headers ?? {}),
    };

    const response = await fetch(url.toString(), {
      method: c.method,
      headers,
    });

    if (!response.ok) {
      throw new Error(`REST API returned ${response.status}: ${response.statusText}`);
    }

    const body: unknown = await response.json();

    let data: Record<string, unknown>[];
    if (c.responsePath) {
      data = this.extractByPath(body, c.responsePath);
    } else if (Array.isArray(body)) {
      data = body as Record<string, unknown>[];
    } else {
      data = [body as Record<string, unknown>];
    }

    const metadata: FetchResult['metadata'] = {
      totalRows: data.length,
      hasMore: false,
    };

    if (c.pagination) {
      const cursorValue = this.extractByPath(body, c.pagination.cursorPath);
      if (Array.isArray(cursorValue) && cursorValue.length > 0) {
        metadata.cursor = String(cursorValue[0]);
        metadata.hasMore = true;
      } else if (cursorValue !== null && cursorValue !== undefined && !Array.isArray(cursorValue)) {
        metadata.cursor = String(cursorValue);
        metadata.hasMore = true;
      }
    }

    this.logger.debug(`Fetched ${data.length} records from ${c.url}`);

    return { data, metadata };
  }

  private extractByPath(obj: unknown, path: string): Record<string, unknown>[] {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return [];
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (Array.isArray(current)) {
      return current as Record<string, unknown>[];
    }
    if (current !== null && current !== undefined) {
      return [current as Record<string, unknown>];
    }
    return [];
  }
}
