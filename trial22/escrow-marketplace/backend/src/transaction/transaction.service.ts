// TRACED:SA-004 — Transaction state machine enforced in service layer
// TRACED:PV-002 — Transaction state machine enforces escrow lifecycle
// TRACED:AC-003 — POST /transactions creates a new escrow transaction
// TRACED:AC-004 — PATCH /transactions/:id/status transitions state machine
// TRACED:AC-005 — GET /transactions returns user's transactions

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TransactionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: [TransactionStatus.FUNDED],
  FUNDED: [TransactionStatus.SHIPPED, TransactionStatus.DISPUTE],
  SHIPPED: [TransactionStatus.DELIVERED, TransactionStatus.DISPUTE],
  DELIVERED: [TransactionStatus.COMPLETED, TransactionStatus.DISPUTE],
  COMPLETED: [],
  DISPUTE: [TransactionStatus.REFUNDED, TransactionStatus.FUNDED],
  REFUNDED: [],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId,
        sellerId: dto.sellerId,
        amount: new Prisma.Decimal(dto.amount),
        description: dto.description,
      },
    });

    this.logger.log(`Transaction created: ${transaction.id}`);
    return transaction;
  }

  async findAllForUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    // findFirst justification: querying by id AND ownership (buyer or seller).
    // Cannot use findUnique because the where clause includes an OR condition
    // on buyerId/sellerId that findUnique does not support.
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true, payout: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(id: string, userId: string, dto: UpdateStatusDto) {
    const transaction = await this.findOneForUser(id, userId);

    const allowedStatuses = VALID_TRANSITIONS[transaction.status];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid state transition from ${transaction.status} to ${dto.status}`,
      );
    }

    // Role-based transition validation
    this.validateRoleForTransition(
      transaction.buyerId,
      transaction.sellerId,
      userId,
      dto.status,
    );

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: dto.status },
    });

    this.logger.log(
      `Transaction ${id} transitioned: ${transaction.status} -> ${dto.status}`,
    );

    // Create payout when transaction reaches COMPLETED
    if (dto.status === TransactionStatus.COMPLETED) {
      await this.prisma.payout.create({
        data: {
          transactionId: id,
          recipientId: transaction.sellerId,
          amount: transaction.amount,
        },
      });
      this.logger.log(`Payout created for transaction ${id}`);
    }

    return updated;
  }

  private validateRoleForTransition(
    buyerId: string,
    sellerId: string,
    userId: string,
    targetStatus: TransactionStatus,
  ) {
    const buyerOnlyStatuses: TransactionStatus[] = [
      TransactionStatus.FUNDED,
      TransactionStatus.DELIVERED,
      TransactionStatus.COMPLETED,
    ];

    const sellerOnlyStatuses: TransactionStatus[] = [
      TransactionStatus.SHIPPED,
    ];

    if (buyerOnlyStatuses.includes(targetStatus) && userId !== buyerId) {
      throw new ForbiddenException('Only the buyer can perform this action');
    }

    if (sellerOnlyStatuses.includes(targetStatus) && userId !== sellerId) {
      throw new ForbiddenException('Only the seller can perform this action');
    }
  }
}
