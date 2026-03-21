import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConnectedAccountDto } from './stripe.dto';

@Injectable()
export class StripeService {
  constructor(private readonly prisma: PrismaService) {}

  async createConnectedAccount(userId: string, dto: CreateConnectedAccountDto) {
    await this.prisma.user.findFirstOrThrow({ where: { id: userId } });

    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: dto.stripeAccountId,
        onboardingStatus: 'PENDING',
      },
    });
  }

  async getOnboardingStatus(userId: string) {
    return this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
    });
  }

  async updateOnboardingStatus(userId: string, status: string) {
    const account = await this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
    });

    return this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: { onboardingStatus: status as never },
    });
  }
}
