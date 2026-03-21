import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto.js';
import type { OnboardingStatus } from '../../generated/prisma/enums.js';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStripeAccountDto) {
    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId: dto.userId,
        stripeAccountId: dto.stripeAccountId,
        onboardingStatus: dto.onboardingStatus,
      },
    });
  }

  async findByUserId(userId: string) {
    // findFirst annotated: userId is unique on StripeConnectedAccount, safe single-result lookup
    const account = await this.prisma.stripeConnectedAccount.findFirst({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return account;
  }

  async updateStatus(id: string, onboardingStatus: OnboardingStatus) {
    return this.prisma.stripeConnectedAccount.update({
      where: { id },
      data: { onboardingStatus },
    });
  }
}
