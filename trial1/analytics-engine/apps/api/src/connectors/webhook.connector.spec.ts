import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookConnector } from './webhook.connector';

describe('WebhookConnector', () => {
  let connector: WebhookConnector;

  beforeEach(() => {
    connector = new WebhookConnector();
  });

  describe('testConnection', () => {
    it('should return invalid when webhookSecret is missing', async () => {
      const result = await connector.testConnection({});
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Webhook secret is required');
    });

    it('should return invalid when expectedSchema is missing', async () => {
      const result = await connector.testConnection({
        webhookSecret: 'secret-123',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Expected schema');
    });

    it('should validate with correct config', async () => {
      const result = await connector.testConnection({
        webhookSecret: 'secret-123',
        expectedSchema: [
          { field: 'event', type: 'STRING' },
          { field: 'amount', type: 'NUMBER' },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.sampleData).toHaveLength(1);
    });
  });

  describe('extract', () => {
    it('should not yield any data (webhook is push-based)', async () => {
      const batches: unknown[][] = [];
      for await (const batch of connector.extract({
        webhookSecret: 'secret',
      })) {
        batches.push(batch);
      }
      expect(batches).toHaveLength(0);
    });
  });

  describe('validatePayload', () => {
    it('should return null for valid payload', () => {
      const error = connector.validatePayload(
        { event: 'purchase', amount: 99.99 },
        [
          { field: 'event', type: 'STRING' },
          { field: 'amount', type: 'NUMBER' },
        ],
      );
      expect(error).toBeNull();
    });

    it('should return error for missing required field', () => {
      const error = connector.validatePayload(
        { event: 'purchase' },
        [
          { field: 'event', type: 'STRING' },
          { field: 'amount', type: 'NUMBER' },
        ],
      );
      expect(error).toContain('Missing required field: amount');
    });

    it('should return error for wrong type', () => {
      const error = connector.validatePayload(
        { event: 'purchase', amount: 'not-a-number' },
        [
          { field: 'event', type: 'STRING' },
          { field: 'amount', type: 'NUMBER' },
        ],
      );
      expect(error).toContain('expected number');
    });
  });

  describe('getSampleData', () => {
    it('should generate sample data from schema', async () => {
      const data = await connector.getSampleData(
        {
          expectedSchema: [
            { field: 'event', type: 'STRING' },
            { field: 'count', type: 'NUMBER' },
            { field: 'active', type: 'BOOLEAN' },
            { field: 'timestamp', type: 'DATE' },
          ],
        },
        3,
      );
      expect(data).toHaveLength(3);
      expect(typeof data[0].event).toBe('string');
      expect(typeof data[0].count).toBe('number');
      expect(typeof data[0].active).toBe('boolean');
      expect(typeof data[0].timestamp).toBe('string');
    });
  });
});
