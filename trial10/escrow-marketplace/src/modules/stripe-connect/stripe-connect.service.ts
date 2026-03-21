import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a Stripe Connect Express account for a provider.
   * In production, this calls Stripe API. For demo, it simulates the flow.
   */
  async createConnectedAccount(userId: string) {
    const simulatedAccountId = `acct_test_${Date.now()}`;

    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: simulatedAccountId,
        onboardingStatus: 'onboarding',
      },
    });
  }

  async getOnboardingUrl(userId: string): Promise<string> {
    const account = await this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
    });

    // In production: generate Stripe Account Link
    return `https://connect.stripe.com/express/onboarding?account=${account.stripeAccountId}`;
  }

  async completeOnboarding(userId: string) {
    return this.prisma.stripeConnectedAccount.update({
      where: { userId },
      data: { onboardingStatus: 'active' },
    });
  }

  async getAccountStatus(userId: string) {
    return this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
    });
  }

  async findAll() {
    return this.prisma.stripeConnectedAccount.findMany({
      include: { user: true },
    });
  }
}
