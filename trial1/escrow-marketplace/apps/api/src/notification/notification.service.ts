import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  paymentReceivedTemplate,
  deliveryConfirmedBuyerTemplate,
  deliveryConfirmedProviderTemplate,
  fundsReleasedTemplate,
  payoutSentTemplate,
  disputeOpenedProviderTemplate,
  disputeOpenedBuyerTemplate,
  disputeResolvedTemplate,
  welcomeTemplate,
} from './templates';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resendApiKey: string | null;
  private readonly fromEmail: string;
  private resend: any | null = null;

  constructor(private readonly config: ConfigService) {
    this.resendApiKey = this.config.get<string>('RESEND_API_KEY', '') || null;
    this.fromEmail = this.config.get<string>(
      'EMAIL_FROM',
      'noreply@escrow-marketplace.demo',
    );

    if (this.resendApiKey) {
      this.initResend();
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set — running in mock mode (emails logged to console)',
      );
    }
  }

  private async initResend() {
    try {
      // @ts-ignore — resend is an optional dependency; falls back to mock mode
      const { Resend } = await import('resend');
      this.resend = new Resend(this.resendApiKey!);
      this.logger.log('Resend SDK initialized for email delivery');
    } catch {
      this.logger.warn(
        'Resend package not installed — falling back to mock mode',
      );
      this.resend = null;
    }
  }

  // ─── Core Send Method ──────────────────────────────────────────────────────

  private async sendEmail(payload: EmailPayload): Promise<void> {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        this.logger.log(`Email sent to ${payload.to}: "${payload.subject}"`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${payload.to}: ${error}`,
        );
      }
    } else {
      // Mock mode: log to console
      this.logger.log(
        `[MOCK EMAIL] To: ${payload.to} | Subject: ${payload.subject}`,
      );
      this.logger.debug(`[MOCK EMAIL] HTML length: ${payload.html.length}`);
    }
  }

  // ─── Payment Received ─────────────────────────────────────────────────────

  async sendPaymentReceived(transaction: {
    id: string;
    amount: number;
    description: string;
    createdAt: Date;
    buyer: { email: string; displayName: string };
    provider: { displayName: string };
  }): Promise<void> {
    const { subject, html } = paymentReceivedTemplate({
      buyerName: transaction.buyer.displayName,
      amount: transaction.amount,
      providerName: transaction.provider.displayName,
      description: transaction.description,
      transactionId: transaction.id,
      createdAt: transaction.createdAt.toISOString(),
    });

    await this.sendEmail({
      to: transaction.buyer.email,
      subject,
      html,
    });
  }

  // ─── Delivery Confirmed ───────────────────────────────────────────────────

  async sendDeliveryConfirmed(transaction: {
    amount: number;
    description: string;
    deliveredAt: Date | null;
    autoReleaseAt: Date | null;
    buyer: { email: string; displayName: string };
    provider: { email: string; displayName: string };
  }): Promise<void> {
    const deliveredAt =
      transaction.deliveredAt?.toISOString() || new Date().toISOString();
    const autoReleaseAt =
      transaction.autoReleaseAt?.toISOString() || 'N/A';

    // Email to buyer
    const buyerEmail = deliveryConfirmedBuyerTemplate({
      buyerName: transaction.buyer.displayName,
      providerName: transaction.provider.displayName,
      amount: transaction.amount,
      description: transaction.description,
      deliveredAt,
      autoReleaseAt,
    });

    await this.sendEmail({
      to: transaction.buyer.email,
      subject: buyerEmail.subject,
      html: buyerEmail.html,
    });

    // Email to provider
    const providerEmail = deliveryConfirmedProviderTemplate({
      providerName: transaction.provider.displayName,
      buyerName: transaction.buyer.displayName,
      amount: transaction.amount,
      description: transaction.description,
      deliveredAt,
    });

    await this.sendEmail({
      to: transaction.provider.email,
      subject: providerEmail.subject,
      html: providerEmail.html,
    });
  }

  // ─── Funds Released ───────────────────────────────────────────────────────

  async sendFundsReleased(transaction: {
    amount: number;
    platformFee: number;
    providerAmount: number;
    description: string;
    releasedAt: Date | null;
    buyer: { displayName: string };
    provider: { email: string; displayName: string };
  }): Promise<void> {
    const { subject, html } = fundsReleasedTemplate({
      providerName: transaction.provider.displayName,
      buyerName: transaction.buyer.displayName,
      amount: transaction.amount,
      platformFee: transaction.platformFee,
      providerAmount: transaction.providerAmount,
      description: transaction.description,
      releasedAt:
        transaction.releasedAt?.toISOString() || new Date().toISOString(),
    });

    await this.sendEmail({
      to: transaction.provider.email,
      subject,
      html,
    });
  }

  // ─── Payout Sent ──────────────────────────────────────────────────────────

  async sendPayoutSent(payout: {
    amount: number;
    paidAt: Date | null;
    transaction: { description: string };
    provider: { email: string; displayName: string };
  }): Promise<void> {
    const { subject, html } = payoutSentTemplate({
      providerName: payout.provider.displayName,
      amount: payout.amount,
      description: payout.transaction.description,
      paidAt: payout.paidAt?.toISOString() || new Date().toISOString(),
    });

    await this.sendEmail({
      to: payout.provider.email,
      subject,
      html,
    });
  }

  // ─── Dispute Opened ───────────────────────────────────────────────────────

  async sendDisputeOpened(dispute: {
    reason: string;
    description: string;
    createdAt: Date;
    transaction: {
      amount: number;
      buyer: { email: string; displayName: string };
      provider: { email: string; displayName: string };
    };
  }): Promise<void> {
    // Email to provider
    const providerEmail = disputeOpenedProviderTemplate({
      providerName: dispute.transaction.provider.displayName,
      buyerName: dispute.transaction.buyer.displayName,
      amount: dispute.transaction.amount,
      disputeReason: dispute.reason,
      disputeDescription: dispute.description,
      disputeCreatedAt: dispute.createdAt.toISOString(),
    });

    await this.sendEmail({
      to: dispute.transaction.provider.email,
      subject: providerEmail.subject,
      html: providerEmail.html,
    });

    // Email to buyer (confirmation)
    const buyerEmail = disputeOpenedBuyerTemplate({
      buyerName: dispute.transaction.buyer.displayName,
      amount: dispute.transaction.amount,
      disputeReason: dispute.reason,
      disputeDescription: dispute.description,
      disputeCreatedAt: dispute.createdAt.toISOString(),
    });

    await this.sendEmail({
      to: dispute.transaction.buyer.email,
      subject: buyerEmail.subject,
      html: buyerEmail.html,
    });
  }

  // ─── Dispute Resolved ─────────────────────────────────────────────────────

  async sendDisputeResolved(
    dispute: {
      status: string;
      resolutionNote: string | null;
      resolvedAt: Date | null;
      transaction: {
        amount: number;
        description: string;
        buyer: { email: string; displayName: string };
        provider: { email: string; displayName: string };
      };
    },
  ): Promise<void> {
    const resolvedAt =
      dispute.resolvedAt?.toISOString() || new Date().toISOString();

    // Email to buyer
    const buyerEmail = disputeResolvedTemplate({
      recipientName: dispute.transaction.buyer.displayName,
      amount: dispute.transaction.amount,
      resolution: dispute.status,
      resolutionNote: dispute.resolutionNote || '',
      resolvedAt,
      description: dispute.transaction.description,
    });

    await this.sendEmail({
      to: dispute.transaction.buyer.email,
      subject: buyerEmail.subject,
      html: buyerEmail.html,
    });

    // Email to provider
    const providerEmail = disputeResolvedTemplate({
      recipientName: dispute.transaction.provider.displayName,
      amount: dispute.transaction.amount,
      resolution: dispute.status,
      resolutionNote: dispute.resolutionNote || '',
      resolvedAt,
      description: dispute.transaction.description,
    });

    await this.sendEmail({
      to: dispute.transaction.provider.email,
      subject: providerEmail.subject,
      html: providerEmail.html,
    });
  }

  // ─── Welcome ──────────────────────────────────────────────────────────────

  async sendWelcome(user: {
    email: string;
    displayName: string;
    role: string;
  }): Promise<void> {
    const { subject, html } = welcomeTemplate({
      displayName: user.displayName,
      role: user.role,
    });

    await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  // ─── Onboarding Reminder ──────────────────────────────────────────────────

  async sendOnboardingReminder(provider: {
    email: string;
    displayName: string;
  }): Promise<void> {
    await this.sendEmail({
      to: provider.email,
      subject: 'Complete your provider onboarding',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #854d0e;">Complete Your Onboarding</h2>
    <p style="margin: 0; color: #a16207;">You're almost ready to start receiving payments.</p>
  </div>

  <p>Hello ${provider.displayName},</p>

  <p>You haven't completed your Stripe onboarding yet. Complete it now to start accepting payments from buyers on the platform.</p>

  <p>Visit your dashboard to continue the onboarding process.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
    });
  }
}
