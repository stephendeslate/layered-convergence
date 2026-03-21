import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, stripeAccountId: string) {
    // findUnique with justification: check for existing account by unique userId
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
    // findUnique with justification: lookup by unique userId
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
