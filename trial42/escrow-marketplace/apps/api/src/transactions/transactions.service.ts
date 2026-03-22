// TRACED: EM-TSVC-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transactions.dto';
import { TransactionStatus } from '@prisma/client';
import { clampPageSize, paginationToSkipTake } from '@escrow-marketplace/shared';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, buyerId: string) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        buyerId,
        sellerId: dto.sellerId,
        listingId: dto.listingId,
        tenantId: dto.tenantId,
      },
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
      },
    });
  }

  async findAll(page: number = 1, pageSize?: number) {
    const clampedSize = clampPageSize(pageSize);
    const { skip, take } = paginationToSkipTake({ page, pageSize: clampedSize });
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take,
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count(),
    ]);
    return {
      data,
      meta: { page, pageSize: clampedSize, total, totalPages: Math.ceil(total / clampedSize) },
    };
  }

  async findOne(id: string) {
    // findFirst: lookup by primary key id, single result expected
    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
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
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    await this.findOne(id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as TransactionStatus }),
      },
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
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.transaction.delete({
      where: { id },
      select: { id: true },
    });
  }
}
