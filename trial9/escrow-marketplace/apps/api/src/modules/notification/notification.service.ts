import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
  userId: string;
  type: 'payment_held' | 'payment_released' | 'dispute_opened' | 'dispute_resolved' | 'payout_completed';
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Send a notification to a user.
   * In production, this would integrate with email, push, or in-app notification services.
   * For SDD trials, we log the notification.
   */
  async send(payload: NotificationPayload): Promise<void> {
    this.logger.log(`Notification sent to ${payload.userId}: [${payload.type}] ${payload.title}`);
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload);
    }
  }
}
