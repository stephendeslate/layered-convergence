import { describe, it, expect, beforeEach } from 'vitest';
import { RestApiConnector } from './rest-api.connector';

describe('RestApiConnector', () => {
  let connector: RestApiConnector;

  beforeEach(() => {
    connector = new RestApiConnector();
  });

  describe('testConnection', () => {
    it('should return invalid when URL is missing', async () => {
      const result = await connector.testConnection({});
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should return mock data when URL is not reachable', async () => {
      const result = await connector.testConnection({
        url: 'mock://example.com',
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData).toBeDefined();
      expect(result.sampleData!.length).toBeGreaterThan(0);
    });

    it('should return sample data with valid mock config', async () => {
      const result = await connector.testConnection({
        url: 'mock://data',
        jsonPath: '$.data',
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData).toBeDefined();
    });
  });

  describe('extract', () => {
    it('should yield mock data batches when URL is not reachable', async () => {
      const batches: unknown[][] = [];
      for await (const batch of connector.extract({
        url: 'mock://data',
      })) {
        batches.push(batch);
      }
      expect(batches.length).toBeGreaterThan(0);
      expect(batches[0].length).toBeGreaterThan(0);
    });

    it('should yield data with correct structure', async () => {
      const batches: unknown[][] = [];
      for await (const batch of connector.extract({ url: 'mock://data' })) {
        batches.push(batch);
      }
      const record = batches[0][0] as Record<string, unknown>;
      expect(record).toHaveProperty('region');
      expect(record).toHaveProperty('revenue');
      expect(record).toHaveProperty('date');
    });
  });

  describe('getSampleData', () => {
    it('should return limited sample data', async () => {
      const data = await connector.getSampleData(
        { url: 'mock://data' },
        3,
      );
      expect(data.length).toBeLessThanOrEqual(3);
    });
  });
});
