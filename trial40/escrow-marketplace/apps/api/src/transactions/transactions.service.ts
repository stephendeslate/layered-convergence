// TRACED: EM-API-008 — Transaction service with state machine
// TRACED: EM-DB-004 — Prisma include for eager loading (N+1 prevention)
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TRANSACTION_STATUS_TRANSITIONS, paginate } from '@escrow-marketplace/shared';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          amount: new Prisma.Decimal(dto.amount),
          buyerId: dto.buyerId,
          sellerId: dto.sellerId,
          listingId: dto.listingId,
          tenantId: dto.tenantId,
        },
      });

      await tx.escrowAccount.create({
        data: {
          amount: new Prisma.Decimal(dto.amount),
          transactionId: transaction.id,
          tenantId: dto.tenantId,
        },
      });

      return transaction;
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { tenantId },
        select: {
          id: true,
          amount: true,
          status: true,
          buyerId: true,
          sellerId: true,
          listingId: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped transaction lookup with relations
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, slug: true, price: true } },
        escrowAccount: true,
        disputes: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateTransactionStatusDto) {
    const transaction = await this.findOne(id, tenantId);
    const currentStatus = transaction.status;
    const allowedTransitions = TRANSACTION_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${dto.status}`,
      );
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: dto.status as 'PENDING' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED' | 'FAILED' },
    });

    if (dto.status === 'DISPUTED' && dto.disputeReason) {
      await this.prisma.dispute.create({
        data: {
          reason: dto.disputeReason,
          transactionId: transaction.id,
          tenantId,
        },
      });
    }

    return updatedTransaction;
  }

  async remove(id: string, tenantId: string) {
    const transaction = await this.findOne(id, tenantId);

    await this.prisma.dispute.deleteMany({
      where: { transactionId: transaction.id },
    });

    await this.prisma.escrowAccount.deleteMany({
      where: { transactionId: transaction.id },
    });

    return this.prisma.transaction.delete({
      where: { id: transaction.id },
    });
  }
}
