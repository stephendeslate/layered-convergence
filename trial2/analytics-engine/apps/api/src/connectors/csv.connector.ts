import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  FetchResult,
  CsvConnectionConfig,
} from '@analytics-engine/shared';
import { parse } from 'csv-parse/sync';

@Injectable()
export class CsvConnector implements Connector {
  private readonly logger = new Logger(CsvConnector.name);

  async validate(config: Record<string, unknown>): Promise<boolean> {
    const c = config as unknown as CsvConnectionConfig;
    if (typeof c.delimiter !== 'string') return false;
    if (typeof c.hasHeader !== 'boolean') return false;
    return true;
  }

  async fetch(
    config: Record<string, unknown>,
    rawData?: string,
  ): Promise<FetchResult> {
    const c = config as unknown as CsvConnectionConfig;

    if (!rawData) {
      throw new Error('CSV connector requires raw data to be provided');
    }

    const records: Record<string, unknown>[] = parse(rawData, {
      delimiter: c.delimiter,
      columns: c.hasHeader ? true : false,
      encoding: (c.encoding as BufferEncoding) || 'utf-8',
      skip_empty_lines: true,
      cast: true,
    });

    this.logger.debug(`Parsed ${records.length} records from CSV`);

    return {
      data: records,
      metadata: { totalRows: records.length, hasMore: false },
    };
  }
}
