import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConnectedAccountService {
  private readonly logger = new Logger(ConnectedAccountService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOnboardingLink(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.role !== 'provider') {
      throw new BadRequestException('Only providers can create connected accounts');
    }

    this.logger.log(`Creating Stripe Connect onboarding for user ${userId}`);

    // In production, this would call Stripe's API to create an Express account
    // For demo, we simulate the account creation
    const stripeAccountId = `acct_demo_${userId.slice(0, 8)}`;

    const account = await this.prisma.stripeConnectedAccount.upsert({
      where: { userId },
      update: { onboardingStatus: 'onboarding' },
      create: {
        userId,
        stripeAccountId,
        onboardingStatus: 'onboarding',
      },
    });

    return {
      account,
      onboardingUrl: `https://connect.stripe.com/express/onboarding/${stripeAccountId}`,
    };
  }

  async findByUser(userId: string) {
    return this.prisma.stripeConnectedAccount.findUniqueOrThrow({
      where: { userId },
      include: { user: true },
    });
  }

  async updateStatus(stripeAccountId: string, status: string) {
    this.logger.log(`Updating account ${stripeAccountId} status to ${status}`);
    return this.prisma.stripeConnectedAccount.update({
      where: { stripeAccountId },
      data: { onboardingStatus: status },
    });
  }

  async findAll() {
    return this.prisma.stripeConnectedAccount.findMany({
      include: { user: true },
    });
  }
}
