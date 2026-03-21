import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  RawRecord,
  ValidationResult,
} from './connector.interface';

/**
 * Webhook connector is unique: it does NOT use the extract() flow.
 * Instead, data arrives via POST to /api/webhooks/:sourceId/:secret.
 *
 * testConnection validates the webhook config.
 * extract is a no-op (webhook data is pushed, not pulled).
 * getSampleData returns mock data for preview.
 */
@Injectable()
export class WebhookConnector implements Connector {
  private readonly logger = new Logger(WebhookConnector.name);

  async testConnection(
    config: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const webhookSecret = config.webhookSecret as string | undefined;

    if (!webhookSecret) {
      return { valid: false, error: 'Webhook secret is required' };
    }

    const expectedSchema = config.expectedSchema as
      | { field: string; type: string }[]
      | undefined;

    if (!expectedSchema || expectedSchema.length === 0) {
      return {
        valid: false,
        error: 'Expected schema must define at least one field',
      };
    }

    this.logger.log('Webhook connector config validated');

    return {
      valid: true,
      sampleData: [
        this.generateSampleFromSchema(expectedSchema),
      ],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async *extract(
    _config: Record<string, unknown>,
    _lastSyncCursor?: string,
  ): AsyncGenerator<RawRecord[]> {
    // Webhook connector does not pull data — data is pushed via HTTP POST.
    // This is intentionally a no-op.
    this.logger.warn(
      'extract() called on WebhookConnector — webhooks are push-based, not pull-based',
    );
  }

  async getSampleData(
    config: Record<string, unknown>,
    limit: number,
  ): Promise<RawRecord[]> {
    const expectedSchema = config.expectedSchema as
      | { field: string; type: string }[]
      | undefined;

    if (!expectedSchema) return [];

    const samples: RawRecord[] = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      samples.push(this.generateSampleFromSchema(expectedSchema));
    }
    return samples;
  }

  /**
   * Validates an incoming webhook payload against the expected schema.
   * Returns null if valid, or an error message if invalid.
   */
  validatePayload(
    payload: Record<string, unknown>,
    expectedSchema: { field: string; type: string }[],
  ): string | null {
    for (const field of expectedSchema) {
      const value = payload[field.field];
      if (value === undefined || value === null) {
        return `Missing required field: ${field.field}`;
      }

      const actualType = typeof value;
      const expectedType = field.type.toLowerCase();

      if (expectedType === 'number' && actualType !== 'number') {
        return `Field '${field.field}' expected number, got ${actualType}`;
      }
      if (expectedType === 'string' && actualType !== 'string') {
        return `Field '${field.field}' expected string, got ${actualType}`;
      }
      if (expectedType === 'boolean' && actualType !== 'boolean') {
        return `Field '${field.field}' expected boolean, got ${actualType}`;
      }
    }
    return null;
  }

  private generateSampleFromSchema(
    schema: { field: string; type: string }[],
  ): RawRecord {
    const record: RawRecord = {};
    for (const field of schema) {
      switch (field.type.toUpperCase()) {
        case 'NUMBER':
          record[field.field] = Math.round(Math.random() * 1000);
          break;
        case 'DATE':
          record[field.field] = new Date().toISOString();
          break;
        case 'BOOLEAN':
          record[field.field] = Math.random() > 0.5;
          break;
        case 'STRING':
        default:
          record[field.field] = `sample_${field.field}`;
          break;
      }
    }
    return record;
  }
}
