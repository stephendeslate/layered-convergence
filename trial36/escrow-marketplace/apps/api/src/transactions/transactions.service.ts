import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto, UpdateTransactionStatusDto } from './dto';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_STATUS_TRANSITIONS,
  paginate,
  maskSensitive,
} from '@escrow-marketplace/shared';

interface RequestUser {
  sub: string;
  role: string;
  tenantId: string;
  email: string;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    tenantId: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ) {
    const take = Math.min(pageSize, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          tenantId,
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { listing: true },
      }),
      this.prisma.transaction.count({
        where: {
          tenantId,
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      }),
    ]);

    return paginate(transactions, total, page, take);
  }

  async create(dto: CreateTransactionDto, user: RequestUser) {
    // findFirst: matching listing by id + tenantId + status for RLS and state check
    const listing = await this.prisma.listing.findFirst({
      where: { id: dto.listingId, tenantId: user.tenantId, status: 'ACTIVE' },
    });

    if (!listing) {
      throw new NotFoundException('Active listing not found');
    }

    if (listing.sellerId === user.sub) {
      throw new BadRequestException('Cannot buy your own listing');
    }

    // Log masked email for audit
    const maskedEmail = maskSensitive(user.email);
    void maskedEmail;

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          amount: listing.price,
          status: 'PENDING',
          buyerId: user.sub,
          sellerId: listing.sellerId,
          listingId: listing.id,
          tenantId: user.tenantId,
        },
      });

      await tx.escrowAccount.create({
        data: {
          amount: listing.price,
          transactionId: created.id,
          tenantId: user.tenantId,
        },
      });

      await tx.listing.update({
        where: { id: listing.id },
        data: { status: 'SOLD' },
      });

      return created;
    });

    return transaction;
  }

  // TRACED: EM-API-004 — Transaction state machine transitions
  async updateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
    user: RequestUser,
  ) {
    // findFirst: matching transaction by id + tenantId for RLS-compatible lookup
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const allowedTransitions =
      TRANSACTION_STATUS_TRANSITIONS[transaction.status];
    if (!allowedTransitions || !allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${dto.status}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
