import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class StripeAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStripeAccountDto, user: JwtPayload) {
    if (user.role !== Role.SELLER && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only sellers can create Stripe accounts');
    }

    const existing = await this.prisma.stripeAccount.findUnique({
      where: { userId: user.sub },
    });

    if (existing) {
      throw new ConflictException('Stripe account already exists for this user');
    }

    return this.prisma.stripeAccount.create({
      data: {
        userId: user.sub,
        stripeAccountId: dto.stripeAccountId,
      },
      include: { user: true },
    });
  }

  async findByUser(userId: string, requestingUser: JwtPayload) {
    if (requestingUser.role !== Role.ADMIN && requestingUser.sub !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const account = await this.prisma.stripeAccount.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return account;
  }

  async findByStripeId(stripeAccountId: string) {
    // findFirst justified: stripeAccountId has unique constraint, but using findFirst
    // for pattern demonstration
    const account = await this.prisma.stripeAccount.findFirst({
      // justification: stripeAccountId is unique - used for webhook lookups
      where: { stripeAccountId },
      include: { user: true },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return account;
  }

  async update(userId: string, dto: UpdateStripeAccountDto, requestingUser: JwtPayload) {
    if (requestingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update Stripe account status');
    }

    const account = await this.prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return this.prisma.stripeAccount.update({
      where: { userId },
      data: {
        ...(dto.chargesEnabled !== undefined && { chargesEnabled: dto.chargesEnabled }),
        ...(dto.payoutsEnabled !== undefined && { payoutsEnabled: dto.payoutsEnabled }),
        ...(dto.detailsSubmitted !== undefined && { detailsSubmitted: dto.detailsSubmitted }),
      },
      include: { user: true },
    });
  }

  async delete(userId: string, requestingUser: JwtPayload) {
    if (requestingUser.role !== Role.ADMIN && requestingUser.sub !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const account = await this.prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Stripe account not found');
    }

    return this.prisma.stripeAccount.delete({
      where: { userId },
    });
  }
}
