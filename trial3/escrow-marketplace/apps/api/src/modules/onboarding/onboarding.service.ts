import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async initiateOnboarding(userId: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId, role: 'PROVIDER' },
    });

    // Check if already onboarded — findFirst justified: existence check
    const existing = await this.prisma.stripeConnectedAccount.findFirst({
      where: { userId },
    });

    if (existing && existing.onboardingStatus === 'ACTIVE') {
      throw new BadRequestException('Provider already onboarded');
    }

    if (existing) {
      return this.prisma.stripeConnectedAccount.update({
        where: { id: existing.id },
        data: { onboardingStatus: 'IN_PROGRESS' },
      });
    }

    // Create placeholder connected account (Stripe account ID set via webhook)
    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId: user.id,
        stripeAccountId: `acct_placeholder_${crypto.randomUUID().slice(0, 8)}`,
        onboardingStatus: 'IN_PROGRESS',
      },
    });
  }

  async getOnboardingStatus(userId: string) {
    return this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
      select: {
        onboardingStatus: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async completeOnboarding(stripeAccountId: string, chargesEnabled: boolean, payoutsEnabled: boolean) {
    return this.prisma.stripeConnectedAccount.update({
      where: { stripeAccountId },
      data: {
        onboardingStatus: chargesEnabled && payoutsEnabled ? 'ACTIVE' : 'RESTRICTED',
        chargesEnabled,
        payoutsEnabled,
      },
    });
  }
}
