import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class StripeAccountService {
  private readonly logger = new Logger(StripeAccountService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initiate Stripe Connect Express onboarding for a provider.
   * In production, this would call Stripe.accounts.create() and return an onboarding link.
   * For CED trials, we simulate the account creation.
   */
  async initiateOnboarding(userId: string) {
    const existingAccount = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (existingAccount) {
      throw new BadRequestException('Provider already has a connected account');
    }

    const simulatedAccountId = `acct_test_${userId.substring(0, 8)}`;

    const account = await this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: simulatedAccountId,
        onboardingStatus: 'pending',
      },
    });

    this.logger.log(`Stripe Connect onboarding initiated for user ${userId}`);
    return {
      ...account,
      onboardingUrl: `https://connect.stripe.com/setup/e/${simulatedAccountId}`,
    };
  }

  async completeOnboarding(stripeAccountId: string) {
    const account = await this.prisma.stripeConnectedAccount.update({
      where: { stripeAccountId },
      data: { onboardingStatus: 'complete' },
    });
    this.logger.log(`Stripe Connect onboarding completed for account ${stripeAccountId}`);
    return account;
  }

  async findByUserId(userId: string) {
    return this.prisma.stripeConnectedAccount.findUnique({ where: { userId } });
  }

  async findByStripeAccountId(stripeAccountId: string) {
    return this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { stripeAccountId },
    });
  }
}
