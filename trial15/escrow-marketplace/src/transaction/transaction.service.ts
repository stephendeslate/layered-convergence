import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

/**
 * Valid state machine transitions for escrow transactions.
 *
 * PENDING → FUNDED (payment received)
 * FUNDED → SHIPPED (seller ships)
 * SHIPPED → DELIVERED (buyer confirms)
 * DELIVERED → RELEASED (payout to seller)
 * PENDING → CANCELLED (buyer cancels)
 * FUNDED → DISPUTED (buyer disputes)
 * DISPUTED → RESOLVED (admin resolves)
 * RESOLVED → RELEASED (admin releases funds to seller)
 * RESOLVED → REFUNDED (admin refunds buyer)
 */
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED, TransactionStatus.CANCELLED],
  [TransactionStatus.FUNDED]: [TransactionStatus.SHIPPED, TransactionStatus.DISPUTED],
  [TransactionStatus.SHIPPED]: [TransactionStatus.DELIVERED],
  [TransactionStatus.DELIVERED]: [TransactionStatus.RELEASED],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.CANCELLED]: [],
  [TransactionStatus.DISPUTED]: [TransactionStatus.RESOLVED],
  [TransactionStatus.RESOLVED]: [TransactionStatus.RELEASED, TransactionStatus.REFUNDED],
  [TransactionStatus.REFUNDED]: [],
};

/**
 * Who is allowed to trigger each transition.
 */
const TRANSITION_PERMISSIONS: Record<string, Role[]> = {
  [`${TransactionStatus.PENDING}->${TransactionStatus.FUNDED}`]: [Role.BUYER],
  [`${TransactionStatus.FUNDED}->${TransactionStatus.SHIPPED}`]: [Role.SELLER],
  [`${TransactionStatus.SHIPPED}->${TransactionStatus.DELIVERED}`]: [Role.BUYER],
  [`${TransactionStatus.DELIVERED}->${TransactionStatus.RELEASED}`]: [Role.ADMIN, Role.BUYER],
  [`${TransactionStatus.PENDING}->${TransactionStatus.CANCELLED}`]: [Role.BUYER],
  [`${TransactionStatus.FUNDED}->${TransactionStatus.DISPUTED}`]: [Role.BUYER],
  [`${TransactionStatus.DISPUTED}->${TransactionStatus.RESOLVED}`]: [Role.ADMIN],
  [`${TransactionStatus.RESOLVED}->${TransactionStatus.RELEASED}`]: [Role.ADMIN],
  [`${TransactionStatus.RESOLVED}->${TransactionStatus.REFUNDED}`]: [Role.ADMIN],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, buyerId: string) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        description: dto.description,
        buyerId,
        sellerId: dto.sellerId,
        status: TransactionStatus.PENDING,
      },
      include: { buyer: true, seller: true },
    });
  }

  async findAll(user: JwtPayload) {
    if (user.role === Role.ADMIN) {
      return this.prisma.transaction.findMany({
        include: { buyer: true, seller: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: user.sub }, { sellerId: user.sub }],
      },
      include: { buyer: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: JwtPayload) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, seller: true, disputes: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Tenant isolation: non-admin users can only see their own transactions
    if (user.role !== Role.ADMIN && transaction.buyerId !== user.sub && transaction.sellerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  async updateStatus(id: string, newStatus: TransactionStatus, user: JwtPayload, shippingInfo?: Record<string, unknown>) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Validate state machine transition
    this.validateTransition(transaction.status, newStatus);

    // Validate permissions for this transition
    this.validatePermission(transaction, user, transaction.status, newStatus);

    const updateData: Record<string, unknown> = { status: newStatus };

    if (shippingInfo && newStatus === TransactionStatus.SHIPPED) {
      updateData['shippingInfo'] = shippingInfo;
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { buyer: true, seller: true },
    });
  }

  validateTransition(currentStatus: TransactionStatus, newStatus: TransactionStatus): void {
    const validTargets = VALID_TRANSITIONS[currentStatus];

    if (!validTargets.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid state transition: ${currentStatus} → ${newStatus}. ` +
        `Valid transitions from ${currentStatus}: ${validTargets.length > 0 ? validTargets.join(', ') : 'none (terminal state)'}`,
      );
    }
  }

  private validatePermission(
    transaction: { buyerId: string; sellerId: string },
    user: JwtPayload,
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ): void {
    const transitionKey = `${currentStatus}->${newStatus}`;
    const allowedRoles = TRANSITION_PERMISSIONS[transitionKey];

    if (!allowedRoles || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(`Role ${user.role} cannot perform transition ${transitionKey}`);
    }

    // Additional check: non-admin users must be a participant
    if (user.role !== Role.ADMIN) {
      if (transaction.buyerId !== user.sub && transaction.sellerId !== user.sub) {
        throw new ForbiddenException('Access denied');
      }
    }
  }

  /**
   * Expose valid transitions for testing and API consumers.
   */
  getValidTransitions(status: TransactionStatus): TransactionStatus[] {
    return VALID_TRANSITIONS[status] ?? [];
  }
}
