// TRACED: EM-TXN-003 — Transactions service with status transitions
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, generateId, TRANSACTION_STATUS_TRANSITIONS, TransactionStatus } from '@escrow-marketplace/shared';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, buyerId: string, data: { listingId: string; amount: string }) {
    return this.prisma.transaction.create({
      data: {
        id: generateId('txn'),
        amount: data.amount,
        status: 'PENDING',
        listingId: data.listingId,
        buyerId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);
    return paginate(items, total, page, pageSize);
  }

  async updateStatus(tenantId: string, id: string, newStatus: string) {
    // findFirst: scoping by tenantId for multi-tenant isolation
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const allowed = TRANSACTION_STATUS_TRANSITIONS[transaction.status as TransactionStatus];
    if (!allowed?.includes(newStatus as TransactionStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
