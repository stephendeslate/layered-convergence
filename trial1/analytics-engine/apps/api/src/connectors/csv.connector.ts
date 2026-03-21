import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  RawRecord,
  ValidationResult,
} from './connector.interface';

const MOCK_CSV_DATA: RawRecord[] = [
  { name: 'Alice', department: 'Sales', amount: 1200, date: '2026-01-15' },
  { name: 'Bob', department: 'Engineering', amount: 800, date: '2026-01-16' },
  { name: 'Carol', department: 'Sales', amount: 1500, date: '2026-01-17' },
  { name: 'Dave', department: 'Marketing', amount: 600, date: '2026-01-18' },
  { name: 'Eve', department: 'Engineering', amount: 2200, date: '2026-01-19' },
];

@Injectable()
export class CsvConnector implements Connector {
  private readonly logger = new Logger(CsvConnector.name);

  async testConnection(
    config: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const fileUrl = config.fileUrl as string | undefined;
    const csvContent = config.csvContent as string | undefined;

    if (!fileUrl && !csvContent) {
      return { valid: false, error: 'fileUrl or csvContent is required' };
    }

    // If raw CSV content is provided (e.g., from upload), parse it
    if (csvContent) {
      try {
        const records = this.parseCsv(
          csvContent,
          (config.delimiter as string) ?? ',',
          (config.hasHeader as boolean) ?? true,
        );
        return { valid: true, sampleData: records.slice(0, 5) };
      } catch (err: unknown) {
        const error = err as Error;
        return { valid: false, error: `CSV parse error: ${error.message}` };
      }
    }

    // Mock mode
    this.logger.log(`Test connection for CSV at ${fileUrl} (mock mode)`);
    return { valid: true, sampleData: MOCK_CSV_DATA.slice(0, 5) };
  }

  async *extract(
    config: Record<string, unknown>,
    _lastSyncCursor?: string,
  ): AsyncGenerator<RawRecord[]> {
    const csvContent = config.csvContent as string | undefined;

    if (csvContent) {
      const records = this.parseCsv(
        csvContent,
        (config.delimiter as string) ?? ',',
        (config.hasHeader as boolean) ?? true,
      );

      // Yield in batches of 100
      for (let i = 0; i < records.length; i += 100) {
        yield records.slice(i, i + 100);
      }
      return;
    }

    // Mock mode
    yield [...MOCK_CSV_DATA];
  }

  async getSampleData(
    config: Record<string, unknown>,
    limit: number,
  ): Promise<RawRecord[]> {
    const result = await this.testConnection(config);
    return (result.sampleData ?? MOCK_CSV_DATA).slice(0, limit);
  }

  private parseCsv(
    content: string,
    delimiter: string,
    hasHeader: boolean,
  ): RawRecord[] {
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];

    let headers: string[];
    let dataLines: string[];

    if (hasHeader) {
      headers = lines[0].split(delimiter).map((h) => h.trim());
      dataLines = lines.slice(1);
    } else {
      // Auto-generate column names
      const colCount = lines[0].split(delimiter).length;
      headers = Array.from({ length: colCount }, (_, i) => `col_${i}`);
      dataLines = lines;
    }

    return dataLines.map((line) => {
      const values = line.split(delimiter).map((v) => v.trim());
      const record: RawRecord = {};
      headers.forEach((header, idx) => {
        const val = values[idx] ?? '';
        // Try to parse as number
        const num = Number(val);
        record[header] = !isNaN(num) && val !== '' ? num : val;
      });
      return record;
    });
  }
}
