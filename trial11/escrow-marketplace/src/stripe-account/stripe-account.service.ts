import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OnboardingStatus } from '../../generated/prisma/client.js';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(userId: string, stripeAccountId: string) {
    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId,
        onboardingStatus: OnboardingStatus.PENDING,
      },
    });
  }

  async getMyAccount(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Stripe connected account not found');
    }

    return account;
  }

  async updateOnboardingStatus(id: string, status: OnboardingStatus) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Stripe connected account not found');
    }

    return this.prisma.stripeConnectedAccount.update({
      where: { id },
      data: { onboardingStatus: status },
    });
  }
}
