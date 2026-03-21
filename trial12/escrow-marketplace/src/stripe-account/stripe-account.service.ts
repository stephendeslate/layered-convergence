import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto.js';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto.js';

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

  async update(id: string, dto: UpdateStripeAccountDto) {
    return this.prisma.stripeConnectedAccount.update({
      where: { id },
      data: {
        ...(dto.stripeAccountId && { stripeAccountId: dto.stripeAccountId }),
        ...(dto.onboardingStatus && { onboardingStatus: dto.onboardingStatus }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.stripeConnectedAccount.delete({
      where: { id },
    });
  }
}
