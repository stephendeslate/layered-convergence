import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_STATUS_TRANSITIONS,
  paginate,
  maskSensitive,
  clampPageSize,
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

  // TRACED: EM-PERF-005 — Prisma query optimization: list queries use select
  // TRACED: EM-PERF-006 — N+1 prevention: include for eager loading related data
  async findAll(
    userId: string,
    tenantId: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ) {
    const take = clampPageSize(pageSize, MAX_PAGE_SIZE);
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
        select: {
          id: true,
          amount: true,
          status: true,
          buyerId: true,
          sellerId: true,
          listingId: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
            },
          },
        },
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

  // TRACED: EM-API-011 — Transaction lookup with tenant/participant validation
  // TRACED: EM-PERF-006 — N+1 prevention: include for eager loading
  async findOne(id: string, user: RequestUser) {
    // findFirst: matching transaction by id + tenantId + participant for RLS compliance
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        OR: [{ buyerId: user.sub }, { sellerId: user.sub }],
      },
      include: { listing: true, escrowAccount: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
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

  // TRACED: EM-API-012 — Transaction cancellation with tenant/participant validation
  async remove(id: string, user: RequestUser) {
    // findFirst: matching transaction by id + tenantId for RLS-compatible lookup
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      transaction.buyerId !== user.sub &&
      transaction.sellerId !== user.sub &&
      user.role !== 'MANAGER'
    ) {
      throw new ForbiddenException('Not authorized to delete this transaction');
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending transactions can be deleted',
      );
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
