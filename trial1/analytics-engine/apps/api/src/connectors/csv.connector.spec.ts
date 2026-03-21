import { describe, it, expect, beforeEach } from 'vitest';
import { CsvConnector } from './csv.connector';

describe('CsvConnector', () => {
  let connector: CsvConnector;

  beforeEach(() => {
    connector = new CsvConnector();
  });

  describe('testConnection', () => {
    it('should return invalid when no fileUrl or csvContent', async () => {
      const result = await connector.testConnection({});
      expect(result.valid).toBe(false);
      expect(result.error).toBe('fileUrl or csvContent is required');
    });

    it('should parse CSV content directly', async () => {
      const csv = 'name,amount,date\nAlice,100,2026-01-01\nBob,200,2026-01-02';
      const result = await connector.testConnection({
        csvContent: csv,
        delimiter: ',',
        hasHeader: true,
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData).toHaveLength(2);
      expect(result.sampleData![0]).toHaveProperty('name', 'Alice');
      expect(result.sampleData![0]).toHaveProperty('amount', 100);
    });

    it('should handle CSV without headers', async () => {
      const csv = 'Alice,100\nBob,200';
      const result = await connector.testConnection({
        csvContent: csv,
        delimiter: ',',
        hasHeader: false,
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData![0]).toHaveProperty('col_0', 'Alice');
      expect(result.sampleData![0]).toHaveProperty('col_1', 100);
    });

    it('should return mock data for fileUrl mode', async () => {
      const result = await connector.testConnection({
        fileUrl: '/uploads/test.csv',
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData!.length).toBeGreaterThan(0);
    });
  });

  describe('extract', () => {
    it('should extract records from CSV content', async () => {
      const csv =
        'name,department,amount\nAlice,Sales,100\nBob,Eng,200\nCarol,Sales,300';
      const batches: unknown[][] = [];
      for await (const batch of connector.extract({
        csvContent: csv,
        delimiter: ',',
        hasHeader: true,
      })) {
        batches.push(batch);
      }
      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(3);
    });

    it('should yield mock data when no csvContent', async () => {
      const batches: unknown[][] = [];
      for await (const batch of connector.extract({
        fileUrl: '/uploads/test.csv',
      })) {
        batches.push(batch);
      }
      expect(batches.length).toBeGreaterThan(0);
    });
  });

  describe('getSampleData', () => {
    it('should respect limit parameter', async () => {
      const csv =
        'a,b\n1,2\n3,4\n5,6\n7,8\n9,10';
      const data = await connector.getSampleData(
        { csvContent: csv, delimiter: ',', hasHeader: true },
        2,
      );
      expect(data.length).toBeLessThanOrEqual(2);
    });
  });
});
