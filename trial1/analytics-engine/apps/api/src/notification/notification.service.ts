import { Injectable, Logger } from '@nestjs/common';

interface SyncRunInfo {
  id: string;
  status: string;
  errorMessage?: string | null;
  startedAt?: Date | null;
}

interface DataSourceInfo {
  id: string;
  name: string;
  tenantId: string;
}

interface TenantInfo {
  id: string;
  name: string;
  email: string;
  tier: string;
}

/**
 * Notification service with dual-mode: real email via Resend if
 * RESEND_API_KEY is set, otherwise console.log mock mode.
 * Per SRS-4 section 5.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly isLiveMode: boolean;
  private readonly fromEmail = 'noreply@analyticsengine.dev';
  private readonly alertsEmail = 'alerts@analyticsengine.dev';

  constructor() {
    this.isLiveMode = !!process.env.RESEND_API_KEY;
    if (this.isLiveMode) {
      this.logger.log('Notification service running in LIVE mode (Resend)');
    } else {
      this.logger.log('Notification service running in MOCK mode (console)');
    }
  }

  /**
   * Send sync failure alert email when sync fails consecutively.
   * Per SRS-4 section 5.2.
   */
  async sendSyncFailureAlert(
    dataSource: DataSourceInfo,
    syncRun: SyncRunInfo,
    tenant: TenantInfo,
    recentRuns: SyncRunInfo[] = [],
  ): Promise<void> {
    const subject = `[Action Required] Sync paused for "${dataSource.name}"`;
    const body = [
      `Hi ${tenant.name},`,
      '',
      `The data source "${dataSource.name}" has failed to sync consecutively and has been automatically paused.`,
      '',
      'Last error:',
      syncRun.errorMessage ?? 'Unknown error',
      '',
      'Recent sync attempts:',
      ...recentRuns.map(
        (r) =>
          `- ${r.startedAt?.toISOString() ?? 'N/A'}: ${r.status} — ${r.errorMessage ?? 'N/A'}`,
      ),
      '',
      'To resume syncing:',
      '1. Review the error details above',
      '2. Check your data source configuration',
      '3. Go to Settings > Data Sources > Resume Sync',
      '',
      '— The Analytics Engine Team',
    ].join('\n');

    await this.send({
      to: tenant.email,
      from: this.alertsEmail,
      subject,
      body,
    });
  }

  /**
   * Send usage limit warning when approaching tier limits.
   * Per SRS-4 section 5.3.
   */
  async sendUsageLimitWarning(
    tenant: TenantInfo,
    metric: string,
    current: number,
    limit: number,
  ): Promise<void> {
    const subject = `You're approaching your ${metric} limit`;
    const body = [
      `Hi ${tenant.name},`,
      '',
      `You've used ${current} of your ${limit} ${metric} on the ${tenant.tier} plan.`,
      '',
      `Consider upgrading to continue growing.`,
      '',
      '— The Analytics Engine Team',
    ].join('\n');

    await this.send({
      to: tenant.email,
      from: this.fromEmail,
      subject,
      body,
    });
  }

  /**
   * Send welcome email after registration.
   * Per SRS-4 section 5.1.
   */
  async sendWelcome(tenant: TenantInfo, verificationUrl?: string): Promise<void> {
    const subject = 'Welcome to Analytics Engine — Verify your email';
    const body = [
      `Hi ${tenant.name},`,
      '',
      "Welcome to Analytics Engine! We're excited to help you embed analytics into your product.",
      '',
      ...(verificationUrl
        ? [
            'Please verify your email address by clicking the link below:',
            '',
            verificationUrl,
            '',
            'This link expires in 24 hours.',
            '',
          ]
        : []),
      'Once verified, you can:',
      '1. Connect your first data source',
      '2. Build a dashboard',
      '3. Generate an embed code',
      '',
      "If you didn't create this account, please ignore this email.",
      '',
      '— The Analytics Engine Team',
    ].join('\n');

    await this.send({
      to: tenant.email,
      from: this.fromEmail,
      subject,
      body,
    });
  }

  /**
   * Send security notification when an API key is created.
   */
  async sendApiKeyCreated(
    tenant: TenantInfo,
    keyPreview: string,
  ): Promise<void> {
    const subject = 'New API key created for your account';
    const body = [
      `Hi ${tenant.name},`,
      '',
      `A new API key ending in "...${keyPreview}" was created for your account.`,
      '',
      'If you did not create this key, please revoke it immediately in your dashboard settings.',
      '',
      '— The Analytics Engine Team',
    ].join('\n');

    await this.send({
      to: tenant.email,
      from: this.fromEmail,
      subject,
      body,
    });
  }

  /**
   * Internal send method — uses Resend in live mode, console.log in mock mode.
   */
  private async send(email: {
    to: string;
    from: string;
    subject: string;
    body: string;
  }): Promise<void> {
    if (this.isLiveMode) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: email.from,
            to: [email.to],
            subject: email.subject,
            text: email.body,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`Resend API error: ${error}`);
        } else {
          this.logger.log(`Email sent to ${email.to}: "${email.subject}"`);
        }
      } catch (err) {
        this.logger.error(`Failed to send email: ${err}`);
      }
    } else {
      this.logger.log(
        `[MOCK EMAIL] To: ${email.to} | Subject: ${email.subject}\n${email.body}`,
      );
    }
  }
}
