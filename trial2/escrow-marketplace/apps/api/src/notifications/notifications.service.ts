import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
  to: string;
  subject: string;
  template: NotificationTemplate;
  data: Record<string, string | number>;
}

export enum NotificationTemplate {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_HELD = 'PAYMENT_HELD',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_EVIDENCE_SUBMITTED = 'DISPUTE_EVIDENCE_SUBMITTED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  PAYOUT_COMPLETED = 'PAYOUT_COMPLETED',
  PAYOUT_FAILED = 'PAYOUT_FAILED',
  PROVIDER_ONBOARDING_COMPLETE = 'PROVIDER_ONBOARDING_COMPLETE',
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(payload: NotificationPayload): Promise<void> {
    const body = this.renderTemplate(payload.template, payload.data);
    this.logger.log(
      `[DEMO] Email to ${payload.to}: ${payload.subject}\n${body}`,
    );
  }

  async notifyPaymentCreated(buyerEmail: string, amount: number, description: string): Promise<void> {
    await this.send({
      to: buyerEmail,
      subject: 'Payment Hold Created',
      template: NotificationTemplate.PAYMENT_CREATED,
      data: { amount: (amount / 100).toFixed(2), description },
    });
  }

  async notifyPaymentHeld(buyerEmail: string, providerEmail: string, amount: number): Promise<void> {
    await this.send({
      to: buyerEmail,
      subject: 'Payment Hold Confirmed',
      template: NotificationTemplate.PAYMENT_HELD,
      data: { amount: (amount / 100).toFixed(2) },
    });
    await this.send({
      to: providerEmail,
      subject: 'New Payment Received',
      template: NotificationTemplate.PAYMENT_HELD,
      data: { amount: (amount / 100).toFixed(2) },
    });
  }

  async notifyPaymentReleased(providerEmail: string, amount: number): Promise<void> {
    await this.send({
      to: providerEmail,
      subject: 'Payment Released',
      template: NotificationTemplate.PAYMENT_RELEASED,
      data: { amount: (amount / 100).toFixed(2) },
    });
  }

  async notifyPaymentRefunded(buyerEmail: string, amount: number): Promise<void> {
    await this.send({
      to: buyerEmail,
      subject: 'Payment Refunded',
      template: NotificationTemplate.PAYMENT_REFUNDED,
      data: { amount: (amount / 100).toFixed(2) },
    });
  }

  async notifyDisputeOpened(buyerEmail: string, providerEmail: string, reason: string): Promise<void> {
    await this.send({
      to: providerEmail,
      subject: 'Dispute Opened on Your Transaction',
      template: NotificationTemplate.DISPUTE_OPENED,
      data: { reason },
    });
    await this.send({
      to: buyerEmail,
      subject: 'Your Dispute Has Been Filed',
      template: NotificationTemplate.DISPUTE_OPENED,
      data: { reason },
    });
  }

  async notifyDisputeResolved(
    buyerEmail: string,
    providerEmail: string,
    resolution: string,
  ): Promise<void> {
    await this.send({
      to: buyerEmail,
      subject: 'Dispute Resolved',
      template: NotificationTemplate.DISPUTE_RESOLVED,
      data: { resolution },
    });
    await this.send({
      to: providerEmail,
      subject: 'Dispute Resolved',
      template: NotificationTemplate.DISPUTE_RESOLVED,
      data: { resolution },
    });
  }

  private renderTemplate(template: NotificationTemplate, data: Record<string, string | number>): string {
    const templates: Record<NotificationTemplate, string> = {
      [NotificationTemplate.PAYMENT_CREATED]:
        `Your payment of $${data.amount} for "${data.description}" has been created and is awaiting confirmation.`,
      [NotificationTemplate.PAYMENT_HELD]:
        `A payment of $${data.amount} is now being held securely. Funds will be released upon delivery confirmation.`,
      [NotificationTemplate.PAYMENT_RELEASED]:
        `$${data.amount} has been released to your account. A transfer to your connected bank account will follow.`,
      [NotificationTemplate.PAYMENT_REFUNDED]:
        `Your payment of $${data.amount} has been refunded. Please allow 5-10 business days for the refund to appear.`,
      [NotificationTemplate.DISPUTE_OPENED]:
        `A dispute has been opened. Reason: ${data.reason}. Please submit evidence within 7 days.`,
      [NotificationTemplate.DISPUTE_EVIDENCE_SUBMITTED]:
        `Evidence has been submitted for review.`,
      [NotificationTemplate.DISPUTE_RESOLVED]:
        `The dispute has been resolved: ${data.resolution}.`,
      [NotificationTemplate.PAYOUT_COMPLETED]:
        `Your payout of $${data.amount} has been completed.`,
      [NotificationTemplate.PAYOUT_FAILED]:
        `Your payout of $${data.amount} has failed. Our team will investigate.`,
      [NotificationTemplate.PROVIDER_ONBOARDING_COMPLETE]:
        `Your Stripe Connect account is now active. You can start receiving payments.`,
    };

    return templates[template] ?? `Notification: ${template}`;
  }
}
