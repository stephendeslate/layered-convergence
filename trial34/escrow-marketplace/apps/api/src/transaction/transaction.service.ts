import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionStatus, TRANSACTION_STATUSES } from '@escrow-marketplace/shared';

// TRACED: EM-DA-STATE-002 — Transaction state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  INITIATED: ['FUNDED', 'CANCELLED'],
  FUNDED: ['SHIPPED', 'DISPUTED', 'REFUNDED'],
  SHIPPED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['COMPLETED', 'DISPUTED'],
  COMPLETED: [],
  DISPUTED: ['REFUNDED', 'COMPLETED'],
  REFUNDED: [],
  CANCELLED: [],
};

// TRACED: EM-FC-TXN-001 — Transaction service with state machine
@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.transaction.findMany({
      where: { tenantId },
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(listingId: string, amount: number, tenantId: string, buyerId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.transaction.create({
      data: {
        listingId,
        amount,
        tenantId,
        buyerId,
        status: 'INITIATED',
      },
    });
  }

  async updateStatus(id: string, newStatus: string, tenantId: string) {
    if (!TRANSACTION_STATUSES.includes(newStatus as TransactionStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching transaction by ID within tenant scope for state transition
    const txn = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });
    if (!txn) {
      throw new NotFoundException('Transaction not found');
    }

    const allowed = VALID_TRANSITIONS[txn.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${txn.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus as TransactionStatus },
    });
  }
}
