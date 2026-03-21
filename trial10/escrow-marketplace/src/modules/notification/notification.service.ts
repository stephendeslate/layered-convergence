import { Injectable, Logger } from '@nestjs/common';

/**
 * Notification service handles internal event-driven notifications.
 * Service-only module — no controller because notifications are triggered
 * by internal events, not HTTP requests (convention 5.30).
 * No DTO required — inputs come from internal service calls (convention 5.31).
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyPaymentReceived(buyerEmail: string, amount: number) {
    this.logger.log(
      `[Notification] Payment received: ${buyerEmail} - $${(amount / 100).toFixed(2)}`,
    );
  }

  async notifyFundsReleased(providerEmail: string, amount: number) {
    this.logger.log(
      `[Notification] Funds released: ${providerEmail} - $${(amount / 100).toFixed(2)}`,
    );
  }

  async notifyDisputeRaised(providerEmail: string, transactionId: string) {
    this.logger.log(
      `[Notification] Dispute raised: ${providerEmail} - Transaction ${transactionId}`,
    );
  }

  async notifyDisputeResolved(
    buyerEmail: string,
    providerEmail: string,
    outcome: string,
  ) {
    this.logger.log(
      `[Notification] Dispute resolved: buyer=${buyerEmail}, provider=${providerEmail}, outcome=${outcome}`,
    );
  }

  async notifyPayoutCompleted(providerEmail: string, amount: number) {
    this.logger.log(
      `[Notification] Payout completed: ${providerEmail} - $${(amount / 100).toFixed(2)}`,
    );
  }
}
