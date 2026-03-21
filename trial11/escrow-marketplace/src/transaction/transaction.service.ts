import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionStatus, UserRole } from '../../generated/prisma/client.js';
import type { User } from '../../generated/prisma/client.js';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED, TransactionStatus.EXPIRED],
  [TransactionStatus.FUNDED]: [TransactionStatus.DELIVERED, TransactionStatus.DISPUTED],
  [TransactionStatus.DELIVERED]: [TransactionStatus.RELEASED, TransactionStatus.DISPUTED],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.DISPUTED]: [TransactionStatus.REFUNDED, TransactionStatus.RELEASED],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.EXPIRED]: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, buyerId: string) {
    return this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        holdUntil: dto.holdUntil ? new Date(dto.holdUntil) : null,
        status: TransactionStatus.PENDING,
      },
      include: { buyer: true, provider: true },
    });
  }

  async findAll(user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.prisma.transaction.findMany({
        include: { buyer: true, provider: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === UserRole.BUYER) {
      return this.prisma.transaction.findMany({
        where: { buyerId: user.id },
        include: { buyer: true, provider: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.transaction.findMany({
      where: { providerId: user.id },
      include: { buyer: true, provider: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, provider: true, dispute: true, stateHistory: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async fund(id: string, user: User) {
    const transaction = await this.findOne(id);
    this.assertParticipant(transaction, user, 'buyer');
    return this.transition(transaction, TransactionStatus.FUNDED, 'Transaction funded');
  }

  async deliver(id: string, user: User) {
    const transaction = await this.findOne(id);
    this.assertParticipant(transaction, user, 'provider');
    return this.transition(transaction, TransactionStatus.DELIVERED, 'Delivery confirmed by provider');
  }

  async release(id: string, user: User) {
    const transaction = await this.findOne(id);
    this.assertParticipant(transaction, user, 'buyer');
    return this.transition(transaction, TransactionStatus.RELEASED, 'Funds released to provider');
  }

  async dispute(id: string, user: User, reason: string) {
    const transaction = await this.findOne(id);
    this.assertParticipant(transaction, user, 'buyer');
    const updated = await this.transition(transaction, TransactionStatus.DISPUTED, reason);

    await this.prisma.dispute.create({
      data: {
        transactionId: id,
        raisedById: user.id,
        reason,
      },
    });

    return updated;
  }

  async refund(id: string, user: User) {
    const transaction = await this.findOne(id);
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can process refunds');
    }
    return this.transition(transaction, TransactionStatus.REFUNDED, 'Transaction refunded');
  }

  async expire(id: string) {
    const transaction = await this.findOne(id);
    return this.transition(transaction, TransactionStatus.EXPIRED, 'Transaction expired');
  }

  private async transition(
    transaction: { id: string; status: TransactionStatus },
    toState: TransactionStatus,
    reason?: string,
  ) {
    const validTargets = VALID_TRANSITIONS[transaction.status];
    if (!validTargets.includes(toState)) {
      throw new BadRequestException(
        `Invalid state transition from ${transaction.status} to ${toState}`,
      );
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: toState },
      include: { buyer: true, provider: true },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: transaction.id,
        fromState: transaction.status,
        toState,
        reason,
      },
    });

    return updated;
  }

  private assertParticipant(
    transaction: { buyerId: string; providerId: string },
    user: User,
    role: 'buyer' | 'provider',
  ) {
    if (user.role === UserRole.ADMIN) return;

    if (role === 'buyer' && transaction.buyerId !== user.id) {
      throw new ForbiddenException('Only the buyer can perform this action');
    }
    if (role === 'provider' && transaction.providerId !== user.id) {
      throw new ForbiddenException('Only the provider can perform this action');
    }
  }
}
