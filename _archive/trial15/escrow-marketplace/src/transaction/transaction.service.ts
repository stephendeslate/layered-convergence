import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionStatus, UserRole } from '../../generated/prisma/enums.js';
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

  async create(dto: CreateTransactionDto, user: User) {
    if (user.role !== UserRole.BUYER) {
      throw new ForbiddenException('Only buyers can create transactions');
    }

    return this.prisma.transaction.create({
      data: {
        buyerId: user.id,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
      },
    });
  }

  async findAll(user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.prisma.transaction.findMany({
        include: { stateHistory: true },
      });
    }

    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: user.id }, { providerId: user.id }],
      },
      include: { stateHistory: true },
    });
  }

  async findById(id: string) {
    // findFirst annotated: lookup by primary key, guaranteed unique
    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
      include: { stateHistory: true, dispute: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async fund(id: string, user: User) {
    return this.transition(id, TransactionStatus.FUNDED, user);
  }

  async deliver(id: string, user: User) {
    return this.transition(id, TransactionStatus.DELIVERED, user);
  }

  async release(id: string, user: User) {
    return this.transition(id, TransactionStatus.RELEASED, user);
  }

  async dispute(id: string, user: User, reason?: string) {
    return this.transition(id, TransactionStatus.DISPUTED, user, reason);
  }

  async refund(id: string, user: User) {
    return this.transition(id, TransactionStatus.REFUNDED, user);
  }

  async transition(
    transactionId: string,
    toState: TransactionStatus,
    user: User,
    reason?: string,
  ) {
    const transaction = await this.findById(transactionId);
    const fromState = transaction.status as TransactionStatus;

    const allowed = VALID_TRANSITIONS[fromState];
    if (!allowed || !allowed.includes(toState)) {
      throw new BadRequestException(
        `Invalid state transition from ${fromState} to ${toState}`,
      );
    }

    this.enforceRolePermission(fromState, toState, user, transaction);

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: toState },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId,
          fromState,
          toState,
          reason: reason ?? null,
        },
      }),
    ]);

    return updated;
  }

  private enforceRolePermission(
    _fromState: TransactionStatus,
    toState: TransactionStatus,
    user: User,
    transaction: { buyerId: string; providerId: string },
  ) {
    switch (toState) {
      case TransactionStatus.FUNDED:
        if (user.id !== transaction.buyerId) {
          throw new ForbiddenException('Only the buyer can fund a transaction');
        }
        break;
      case TransactionStatus.DELIVERED:
        if (user.id !== transaction.providerId) {
          throw new ForbiddenException('Only the provider can mark as delivered');
        }
        break;
      case TransactionStatus.RELEASED:
        if (
          _fromState === TransactionStatus.DELIVERED &&
          user.id !== transaction.buyerId
        ) {
          throw new ForbiddenException('Only the buyer can release funds');
        }
        if (
          _fromState === TransactionStatus.DISPUTED &&
          user.role !== UserRole.ADMIN
        ) {
          throw new ForbiddenException('Only admin can release disputed funds');
        }
        break;
      case TransactionStatus.DISPUTED:
        if (
          user.id !== transaction.buyerId &&
          user.id !== transaction.providerId
        ) {
          throw new ForbiddenException('Only the buyer or provider can dispute');
        }
        break;
      case TransactionStatus.REFUNDED:
        if (user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('Only admin can refund');
        }
        break;
      case TransactionStatus.EXPIRED:
        if (user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('Only admin can expire transactions');
        }
        break;
    }
  }
}
