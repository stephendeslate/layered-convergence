import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Role } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

// [TRACED:DM-003] Transaction state machine with exhaustive valid transitions
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED],
  [TransactionStatus.FUNDED]: [
    TransactionStatus.SHIPPED,
    TransactionStatus.DISPUTED,
  ],
  [TransactionStatus.SHIPPED]: [TransactionStatus.DELIVERED],
  [TransactionStatus.DELIVERED]: [TransactionStatus.RELEASED],
  [TransactionStatus.DISPUTED]: [TransactionStatus.RESOLVED],
  [TransactionStatus.RESOLVED]: [
    TransactionStatus.RELEASED,
    TransactionStatus.REFUNDED,
  ],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.REFUNDED]: [],
};

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // [TRACED:AC-006] POST /transactions - buyer creates escrow transaction
  async create(
    userId: string,
    userRole: string,
    dto: CreateTransactionDto,
  ) {
    if (userRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can create transactions');
    }

    await this.prisma.setRlsContext(userId);

    return this.prisma.transaction.create({
      data: {
        buyerId: userId,
        sellerId: dto.sellerId,
        amount: dto.amount,
        description: dto.description,
      },
      include: { buyer: { select: { id: true, email: true, role: true } }, seller: { select: { id: true, email: true, role: true } } },
    });
  }

  // [TRACED:AC-007] GET /transactions - returns user's transactions (buyer or seller)
  async findAll(userId: string) {
    await this.prisma.setRlsContext(userId);

    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { buyer: { select: { id: true, email: true, role: true } }, seller: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.prisma.setRlsContext(userId);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true, role: true } },
        seller: { select: { id: true, email: true, role: true } },
        disputes: true,
        payouts: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  // [TRACED:AC-008] PATCH /transactions/:id/status - validates state machine transitions
  async updateStatus(
    userId: string,
    userRole: string,
    id: string,
    dto: UpdateTransactionStatusDto,
  ) {
    await this.prisma.setRlsContext(userId);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const allowedTransitions = VALID_TRANSITIONS[transaction.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${dto.status}`,
      );
    }

    this.validateRoleForTransition(userRole, transaction, dto.status);

    return this.prisma.transaction.update({
      where: { id },
      data: { status: dto.status },
      include: { buyer: { select: { id: true, email: true, role: true } }, seller: { select: { id: true, email: true, role: true } } },
    });
  }

  // [TRACED:DM-004] Role-specific transition validation (buyers fund/deliver/dispute, sellers ship)
  private validateRoleForTransition(
    userRole: string,
    transaction: { buyerId: string; sellerId: string },
    newStatus: TransactionStatus,
  ) {
    const buyerActions = [
      TransactionStatus.FUNDED,
      TransactionStatus.DELIVERED,
      TransactionStatus.DISPUTED,
    ];
    const sellerActions = [TransactionStatus.SHIPPED];

    if (buyerActions.includes(newStatus) && userRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can perform this action');
    }
    if (sellerActions.includes(newStatus) && userRole !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can perform this action');
    }
  }
}
