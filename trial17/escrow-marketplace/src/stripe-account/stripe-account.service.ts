import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, stripeAccountId: string) {
    const existing = await this.prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Stripe account already exists for this user');
    }

    return this.prisma.stripeAccount.create({
      data: {
        userId,
        stripeAccountId,
        chargesEnabled: false,
        payoutsEnabled: false,
      },
    });
  }

  async findByUserId(userId: string) {
    const account = await this.prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return account;
  }

  async update(
    stripeAccountId: string,
    data: {
      chargesEnabled?: boolean;
      payoutsEnabled?: boolean;
      detailsSubmitted?: boolean;
    },
  ) {
    return this.prisma.stripeAccount.update({
      where: { stripeAccountId },
      data: {
        ...(data.chargesEnabled !== undefined && {
          chargesEnabled: data.chargesEnabled,
        }),
        ...(data.payoutsEnabled !== undefined && {
          payoutsEnabled: data.payoutsEnabled,
        }),
      },
    });
  }
}
