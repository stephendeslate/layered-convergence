import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConnectedAccountStatus } from '@prisma/client';
import { CreateConnectedAccountDto } from './dto/create-connected-account.dto';

@Injectable()
export class ConnectedAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateConnectedAccountDto) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId, role: 'PROVIDER' },
    });

    if (!user) {
      throw new BadRequestException('Only providers can create connected accounts');
    }

    return this.prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: dto.stripeAccountId,
        onboardingStatus: ConnectedAccountStatus.PENDING,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
    });
  }

  async updateStatus(userId: string, status: ConnectedAccountStatus) {
    const account = await this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
    });

    return this.prisma.stripeConnectedAccount.update({
      where: { id: account.id },
      data: { onboardingStatus: status },
    });
  }

  async getOnboardingUrl(userId: string) {
    const account = await this.prisma.stripeConnectedAccount.findFirstOrThrow({
      where: { userId },
    });

    // In production, this would call Stripe's Account Links API
    return {
      url: `https://connect.stripe.com/express/onboarding/${account.stripeAccountId}`,
      accountId: account.stripeAccountId,
    };
  }
}
