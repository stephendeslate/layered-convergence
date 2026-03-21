import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import {
  OnboardingStatus,
  TransactionStatus,
  AuditAction,
} from '@prisma/client';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  // ─── Initiate Onboarding ────────────────────────────────────────────────────

  async initiateOnboarding(userId: string, email: string) {
    // Check if account already exists
    let account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (account && account.onboardingStatus === OnboardingStatus.COMPLETE) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Onboarding already complete',
        error: 'ALREADY_ONBOARDED',
      });
    }

    if (!account) {
      // Create Stripe Express account
      const stripeAccount = await this.stripe.createConnectedAccount({
        email,
        metadata: { userId },
      });

      account = await this.prisma.stripeConnectedAccount.create({
        data: {
          userId,
          stripeAccountId: stripeAccount.id,
          onboardingStatus: OnboardingStatus.PENDING,
        },
      });
    }

    // Create account link for onboarding
    const link = await this.stripe.createAccountLink({
      accountId: account.stripeAccountId,
      refreshUrl: `${this.frontendUrl}/onboarding/refresh`,
      returnUrl: `${this.frontendUrl}/onboarding/complete`,
    });

    // Store onboarding URL
    await this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: { onboardingUrl: link.url },
    });

    return { url: link.url };
  }

  // ─── Handle Onboarding Complete (webhook) ───────────────────────────────────

  async handleOnboardingUpdate(stripeAccountId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { stripeAccountId },
    });

    if (!account) {
      this.logger.warn(
        `No connected account found for Stripe account ${stripeAccountId}`,
      );
      return null;
    }

    // Fetch current status from Stripe
    const stripeData = await this.stripe.getAccount(stripeAccountId);

    // Determine onboarding status
    let onboardingStatus: OnboardingStatus;
    let auditAction: AuditAction | null = null;

    if (
      stripeData.chargesEnabled &&
      stripeData.payoutsEnabled &&
      stripeData.detailsSubmitted
    ) {
      onboardingStatus = OnboardingStatus.COMPLETE;
      if (account.onboardingStatus !== OnboardingStatus.COMPLETE) {
        auditAction = AuditAction.PROVIDER_ONBOARDED;
      }
    } else if (stripeData.detailsSubmitted && !stripeData.chargesEnabled) {
      onboardingStatus = OnboardingStatus.RESTRICTED;
      if (account.onboardingStatus !== OnboardingStatus.RESTRICTED) {
        auditAction = AuditAction.PROVIDER_RESTRICTED;
      }
    } else {
      onboardingStatus = OnboardingStatus.PENDING;
    }

    const updated = await this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: {
        chargesEnabled: stripeData.chargesEnabled,
        payoutsEnabled: stripeData.payoutsEnabled,
        detailsSubmitted: stripeData.detailsSubmitted,
        onboardingStatus,
      },
    });

    // Log audit if status changed meaningfully
    if (auditAction) {
      // Find any transaction for this provider to log against
      // (or create a placeholder — for onboarding we use the account's userId)
      this.logger.log(
        `Provider ${account.userId} onboarding status: ${onboardingStatus}`,
      );
    }

    return updated;
  }

  // ─── Get Onboarding Status ──────────────────────────────────────────────────

  async getOnboardingStatus(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return {
        onboardingStatus: OnboardingStatus.NOT_STARTED,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboardingUrl: null,
      };
    }

    return {
      onboardingStatus: account.onboardingStatus,
      chargesEnabled: account.chargesEnabled,
      payoutsEnabled: account.payoutsEnabled,
      detailsSubmitted: account.detailsSubmitted,
      onboardingUrl: account.onboardingUrl,
    };
  }

  // ─── Provider Dashboard ─────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const [totalEarned, pendingRelease, availablePayout] = await Promise.all([
      // Total earned: PAID_OUT transactions
      this.prisma.transaction.aggregate({
        where: {
          providerId: userId,
          status: TransactionStatus.PAID_OUT,
        },
        _sum: { providerAmount: true },
      }),
      // Pending release: PAYMENT_HELD or DELIVERED
      this.prisma.transaction.aggregate({
        where: {
          providerId: userId,
          status: {
            in: [TransactionStatus.PAYMENT_HELD, TransactionStatus.DELIVERED],
          },
        },
        _sum: { providerAmount: true },
      }),
      // Available for payout: RELEASED
      this.prisma.transaction.aggregate({
        where: {
          providerId: userId,
          status: TransactionStatus.RELEASED,
        },
        _sum: { providerAmount: true },
      }),
    ]);

    return {
      totalEarnedCents: totalEarned._sum.providerAmount || 0,
      pendingReleaseCents: pendingRelease._sum.providerAmount || 0,
      availablePayoutCents: availablePayout._sum.providerAmount || 0,
    };
  }

  // ─── Refresh Onboarding Link ────────────────────────────────────────────────

  async refreshOnboardingLink(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'No connected account found. Start onboarding first.',
        error: 'NOT_FOUND',
      });
    }

    const link = await this.stripe.createAccountLink({
      accountId: account.stripeAccountId,
      refreshUrl: `${this.frontendUrl}/onboarding/refresh`,
      returnUrl: `${this.frontendUrl}/onboarding/complete`,
    });

    await this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: { onboardingUrl: link.url },
    });

    return { url: link.url };
  }
}
