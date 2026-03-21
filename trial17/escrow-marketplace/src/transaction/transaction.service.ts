import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

/**
 * VALID_TRANSITIONS: State machine definition.
 * 9-state escrow lifecycle:
 *   PENDING -> FUNDED, CANCELLED
 *   FUNDED -> SHIPPED, DISPUTED, CANCELLED
 *   SHIPPED -> DELIVERED, DISPUTED
 *   DELIVERED -> RELEASED, DISPUTED
 *   RELEASED -> (terminal)
 *   CANCELLED -> REFUNDED
 *   DISPUTED -> RESOLVED
 *   RESOLVED -> RELEASED, REFUNDED
 *   REFUNDED -> (terminal)
 */
export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> =
  {
    [TransactionStatus.PENDING]: [
      TransactionStatus.FUNDED,
      TransactionStatus.CANCELLED,
    ],
    [TransactionStatus.FUNDED]: [
      TransactionStatus.SHIPPED,
      TransactionStatus.DISPUTED,
      TransactionStatus.CANCELLED,
    ],
    [TransactionStatus.SHIPPED]: [
      TransactionStatus.DELIVERED,
      TransactionStatus.DISPUTED,
    ],
    [TransactionStatus.DELIVERED]: [
      TransactionStatus.RELEASED,
      TransactionStatus.DISPUTED,
    ],
    [TransactionStatus.RELEASED]: [],
    [TransactionStatus.CANCELLED]: [
      TransactionStatus.REFUNDED,
    ],
    [TransactionStatus.DISPUTED]: [TransactionStatus.RESOLVED],
    [TransactionStatus.RESOLVED]: [
      TransactionStatus.RELEASED,
      TransactionStatus.REFUNDED,
    ],
    [TransactionStatus.REFUNDED]: [],
  };

/**
 * TRANSITION_PERMISSIONS: Role-based access for each target status.
 */
export const TRANSITION_PERMISSIONS: Record<TransactionStatus, Role[]> = {
  [TransactionStatus.PENDING]: [Role.BUYER],
  [TransactionStatus.FUNDED]: [Role.BUYER],
  [TransactionStatus.SHIPPED]: [Role.SELLER],
  [TransactionStatus.DELIVERED]: [Role.BUYER],
  [TransactionStatus.RELEASED]: [Role.BUYER, Role.ADMIN],
  [TransactionStatus.CANCELLED]: [Role.BUYER, Role.SELLER, Role.ADMIN],
  [TransactionStatus.DISPUTED]: [Role.BUYER, Role.SELLER],
  [TransactionStatus.RESOLVED]: [Role.ADMIN],
  [TransactionStatus.REFUNDED]: [Role.ADMIN],
};

const PLATFORM_FEE_RATE = 0.025;

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, user: CurrentUserPayload) {
    if (user.role !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can create transactions');
    }

    await this.prisma.setRLSContext(user.sub, user.role);

    const platformFee = new Prisma.Decimal(dto.amount)
      .mul(PLATFORM_FEE_RATE)
      .toDecimalPlaces(2);

    return this.prisma.transaction.create({
      data: {
        title: dto.title,
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        platformFee,
        buyerId: user.sub,
        sellerId: dto.sellerId,
        status: TransactionStatus.PENDING,
      },
      include: { buyer: true, seller: true },
    });
  }

  async findAll(user: CurrentUserPayload, status?: TransactionStatus) {
    await this.prisma.setRLSContext(user.sub, user.role);

    const where: Prisma.TransactionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (user.role !== Role.ADMIN) {
      where.OR = [{ buyerId: user.sub }, { sellerId: user.sub }];
    }

    return this.prisma.transaction.findMany({
      where,
      include: { buyer: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, seller: true, disputes: true, payouts: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findOneWithAccess(id: string, user: CurrentUserPayload) {
    await this.prisma.setRLSContext(user.sub, user.role);

    const transaction = await this.findOne(id);

    if (
      user.role !== Role.ADMIN &&
      transaction.buyerId !== user.sub &&
      transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }

    return transaction;
  }

  async transition(
    id: string,
    targetStatus: TransactionStatus,
    user: CurrentUserPayload,
  ) {
    await this.prisma.setRLSContext(user.sub, user.role);

    const transaction = await this.findOne(id);

    if (
      user.role !== Role.ADMIN &&
      transaction.buyerId !== user.sub &&
      transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }

    const validTargets = VALID_TRANSITIONS[transaction.status];
    if (!validTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${targetStatus}`,
      );
    }

    const allowedRoles = TRANSITION_PERMISSIONS[targetStatus];
    if (!allowedRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `Role ${user.role} cannot trigger transition to ${targetStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: targetStatus },
      include: { buyer: true, seller: true },
    });
  }

  async getStatusCounts(userId: string, role: string) {
    await this.prisma.setRLSContext(userId, role);

    const where: Prisma.TransactionWhereInput =
      role === Role.ADMIN
        ? {}
        : { OR: [{ buyerId: userId }, { sellerId: userId }] };

    const counts = await this.prisma.transaction.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const result: Record<string, number> = {};
    for (const entry of counts) {
      result[entry.status] = entry._count.status;
    }

    return result;
  }
}
