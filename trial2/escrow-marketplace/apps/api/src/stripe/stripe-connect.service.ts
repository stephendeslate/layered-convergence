import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnboardingStatus } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';

@Injectable()
export class StripeConnectService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async initiateOnboarding(userId: string): Promise<{ url: string; accountId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { connectedAccount: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'PROVIDER') {
      throw new BadRequestException('Only providers can onboard');
    }

    let stripeAccountId: string;

    if (user.connectedAccount) {
      stripeAccountId = user.connectedAccount.stripeAccountId;
    } else {
      const account = await this.stripeService.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await this.prisma.stripeConnectedAccount.create({
        data: {
          userId,
          stripeAccountId: account.id,
          onboardingStatus: OnboardingStatus.PENDING,
        },
      });
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');

    const accountLink = await this.stripeService.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/provider/onboarding/refresh`,
      return_url: `${appUrl}/provider/onboarding/return`,
      type: 'account_onboarding',
    });

    return {
      url: accountLink.url,
      accountId: stripeAccountId,
    };
  }

  async refreshOnboardingLink(userId: string): Promise<{ url: string }> {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('No connected account found. Start onboarding first.');
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');

    const accountLink = await this.stripeService.stripe.accountLinks.create({
      account: account.stripeAccountId,
      refresh_url: `${appUrl}/provider/onboarding/refresh`,
      return_url: `${appUrl}/provider/onboarding/return`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  async checkAccountStatus(userId: string) {
    const record = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!record) {
      return {
        onboardingStatus: OnboardingStatus.NOT_STARTED,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    const account = await this.stripeService.stripe.accounts.retrieve(
      record.stripeAccountId,
    );

    let status: OnboardingStatus;
    if (account.charges_enabled && account.payouts_enabled) {
      status = OnboardingStatus.ACTIVE;
    } else if (account.details_submitted) {
      status = OnboardingStatus.RESTRICTED;
    } else {
      status = OnboardingStatus.PENDING;
    }

    await this.prisma.stripeConnectedAccount.update({
      where: { id: record.id },
      data: {
        onboardingStatus: status,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        detailsSubmitted: account.details_submitted ?? false,
      },
    });

    return {
      accountId: record.stripeAccountId,
      onboardingStatus: status,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    };
  }
}
