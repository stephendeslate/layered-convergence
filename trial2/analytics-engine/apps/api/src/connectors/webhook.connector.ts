import { Injectable, Logger } from '@nestjs/common';
import {
  Connector,
  FetchResult,
  WebhookConnectionConfig,
} from '@analytics-engine/shared';
import { verifyWebhookSignature } from '../common/encryption';

@Injectable()
export class WebhookConnector implements Connector {
  private readonly logger = new Logger(WebhookConnector.name);

  async validate(config: Record<string, unknown>): Promise<boolean> {
    const c = config as unknown as WebhookConnectionConfig;
    if (!c.webhookUrl || typeof c.webhookUrl !== 'string') return false;
    return true;
  }

  async fetch(config: Record<string, unknown>): Promise<FetchResult> {
    // Webhooks are push-based; this method processes received data.
    // Actual data arrives via the webhook endpoint, not via polling.
    throw new Error('Webhook connector does not support pull-based fetch. Data arrives via webhook endpoint.');
  }

  verifyPayload(
    body: Buffer,
    signature: string,
    secret: string,
    algorithm?: string,
  ): boolean {
    const signatureAlgorithm = algorithm ?? 'sha256';
    const isValid = verifyWebhookSignature(body, signature, secret, signatureAlgorithm);
    this.logger.debug(`Webhook signature verification: ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  }

  parsePayload(body: unknown): Record<string, unknown>[] {
    if (Array.isArray(body)) {
      return body as Record<string, unknown>[];
    }
    if (body !== null && typeof body === 'object') {
      return [body as Record<string, unknown>];
    }
    throw new Error('Invalid webhook payload: expected object or array');
  }
}
