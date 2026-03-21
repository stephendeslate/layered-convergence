import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingStatus } from '@prisma/client';
import { OnboardProviderDto } from './dto/onboard-provider.dto';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onboardProvider(dto: OnboardProviderDto) {
    // In production: create Stripe Express account, generate onboarding link
    const stripeAccountId = `acct_demo_${Date.now()}`;

    const account = await this.prisma.stripeConnectedAccount.create({
      data: {
        userId: dto.userId,
        stripeAccountId,
        onboardingStatus: OnboardingStatus.PENDING,
      },
    });

    this.logger.log(`Stripe Connect account created for user ${dto.userId}: ${stripeAccountId}`);

    return {
      account,
      onboardingUrl: `https://connect.stripe.com/setup/s/${stripeAccountId}`,
    };
  }

  async completeOnboarding(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: {
        onboardingStatus: OnboardingStatus.COMPLETE,
        payoutsEnabled: true,
      },
    });
  }

  async getAccountStatus(userId: string) {
    return this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
    });
  }

  async refreshOnboardingLink(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
    });

    return {
      onboardingUrl: `https://connect.stripe.com/setup/s/${account.stripeAccountId}`,
    };
  }
}
