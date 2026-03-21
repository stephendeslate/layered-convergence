import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStripeAccountDto) {
    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: dto.stripeAccountId,
      },
      include: { user: true },
    });
  }

  async findByUser(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!account) {
      throw new NotFoundException(
        `Stripe account for user ${userId} not found`,
      );
    }
    return account;
  }

  async completeOnboarding(userId: string) {
    return this.prisma.stripeConnectedAccount.update({
      where: { userId },
      data: { onboardingComplete: true },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.stripeConnectedAccount.findMany({
      include: { user: true },
    });
  }
}
