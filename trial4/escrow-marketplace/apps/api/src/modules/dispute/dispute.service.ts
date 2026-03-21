import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dispute.dto';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: {
        id: dto.transactionId,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
    });

    if (transaction.status !== 'HELD') {
      throw new BadRequestException('Can only dispute transactions in HELD status');
    }

    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          transactionId: dto.transactionId,
          raisedById: userId,
          evidence: dto.evidence ?? {},
        },
        include: { transaction: true, raisedBy: true },
      });

      await tx.transaction.update({
        where: { id: dto.transactionId },
        data: { status: 'DISPUTED' },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: dto.transactionId,
          fromState: transaction.status,
          toState: 'DISPUTED',
          reason: `Dispute raised by user ${userId}`,
        },
      });

      return dispute;
    });
  }

  async findByUser(userId: string) {
    return this.prisma.dispute.findMany({
      where: {
        transaction: {
          OR: [{ buyerId: userId }, { providerId: userId }],
        },
      },
      include: { transaction: true, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.dispute.findFirstOrThrow({
      where: {
        id,
        transaction: {
          OR: [{ buyerId: userId }, { providerId: userId }],
        },
      },
      include: {
        transaction: { include: { buyer: true, provider: true } },
        raisedBy: true,
      },
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true },
    });

    if (dispute.resolution) {
      throw new BadRequestException('Dispute already resolved');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id },
        data: {
          resolution: dto.resolution as never,
          resolvedAt: new Date(),
        },
        include: { transaction: true },
      });

      // Side effect: resolve in buyer's favor -> refund
      if (dto.resolution === 'BUYER_FAVOR') {
        await tx.transaction.update({
          where: { id: dispute.transactionId },
          data: { status: 'REFUNDED' },
        });
        await tx.transactionStateHistory.create({
          data: {
            transactionId: dispute.transactionId,
            fromState: 'DISPUTED',
            toState: 'REFUNDED',
            reason: `Dispute resolved in buyer favor`,
          },
        });
      }

      // Side effect: resolve in provider's favor -> release
      if (dto.resolution === 'PROVIDER_FAVOR') {
        await tx.transaction.update({
          where: { id: dispute.transactionId },
          data: { status: 'RELEASED' },
        });
        await tx.transactionStateHistory.create({
          data: {
            transactionId: dispute.transactionId,
            fromState: 'DISPUTED',
            toState: 'RELEASED',
            reason: `Dispute resolved in provider favor`,
          },
        });
        await tx.payout.create({
          data: {
            providerId: dispute.transaction.providerId,
            transactionId: dispute.transactionId,
            amount: dispute.transaction.amount - dispute.transaction.platformFee,
            status: 'PENDING',
          },
        });
      }

      return updated;
    });
  }
}
