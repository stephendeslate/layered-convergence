import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { OnboardingStatus } from '@prisma/client';

@Injectable()
export class StripeConnectService {
  constructor(private readonly prisma: PrismaService) {}

  async initiateOnboarding(dto: OnboardingDto) {
    // In production, this would call Stripe API to create an Express account
    const mockStripeAccountId = `acct_${Date.now()}`;

    const account = await this.prisma.stripeConnectedAccount.create({
      data: {
        userId: dto.userId,
        stripeAccountId: mockStripeAccountId,
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
      },
    });

    return {
      accountId: account.stripeAccountId,
      onboardingUrl: `https://connect.stripe.com/setup/c/${mockStripeAccountId}`,
    };
  }

  async completeOnboarding(stripeAccountId: string) {
    return this.prisma.stripeConnectedAccount.update({
      where: { stripeAccountId },
      data: { onboardingStatus: OnboardingStatus.COMPLETE },
    });
  }

  async getAccountByUser(userId: string) {
    return this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
      include: { user: true },
    });
  }

  async getAccountByStripeId(stripeAccountId: string) {
    return this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { stripeAccountId },
    });
  }
}
