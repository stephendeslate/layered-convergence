// TRACED:EM-TXN-01 transaction service with N+1 prevention
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { normalizePageParams } from '@em/shared';

const transactionSelect = {
  id: true,
  amount: true,
  status: true,
  buyerId: true,
  sellerId: true,
  listingId: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  buyer: { select: { id: true, email: true } },
  seller: { select: { id: true, email: true } },
  listing: { select: { id: true, title: true } },
} as const;

@Injectable()
export class TransactionService {
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
      select: transactionSelect,
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { tenantId },
        select: transactionSelect,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for multi-tenant isolation
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      select: transactionSelect,
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(id: string, tenantId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, tenantId);
    return this.prisma.transaction.update({
      where: { id },
      data: dto,
      select: transactionSelect,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.transaction.delete({ where: { id } });
  }
}
