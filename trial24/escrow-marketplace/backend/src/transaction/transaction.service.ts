import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-status.dto';

// [TRACED:AC-002] Transaction state machine: valid transitions map
// [TRACED:PV-003] Core escrow flow: PENDING->FUNDED->SHIPPED->DELIVERED->COMPLETED
// [TRACED:SA-003] State machine pattern enforces business rules at service layer
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED],
  [TransactionStatus.FUNDED]: [TransactionStatus.SHIPPED, TransactionStatus.DISPUTE, TransactionStatus.REFUNDED],
  [TransactionStatus.SHIPPED]: [TransactionStatus.DELIVERED, TransactionStatus.DISPUTE],
  [TransactionStatus.DELIVERED]: [TransactionStatus.COMPLETED, TransactionStatus.DISPUTE],
  [TransactionStatus.COMPLETED]: [],
  [TransactionStatus.DISPUTE]: [TransactionStatus.REFUNDED, TransactionStatus.COMPLETED],
  [TransactionStatus.REFUNDED]: [],
};

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    await this.tenantContext.setCurrentUser(buyerId);

    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        buyerId,
        sellerId: dto.sellerId,
      },
    });
  }

  async findAll(userId: string) {
    await this.tenantContext.setCurrentUser(userId);

    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate transaction by ID with user scope — justification: combines ID lookup with authorization check
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true, payouts: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(userId: string, id: string, dto: UpdateTransactionStatusDto) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate transaction for status update — justification: verifies ownership before state transition
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Validate state machine transition
    const allowedNext = VALID_TRANSITIONS[transaction.status];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${dto.status}`,
      );
    }

    // Role-based transition rules
    if (dto.status === TransactionStatus.FUNDED && transaction.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can fund a transaction');
    }
    if (dto.status === TransactionStatus.SHIPPED && transaction.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can mark as shipped');
    }
    if (dto.status === TransactionStatus.DELIVERED && transaction.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can confirm delivery');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
