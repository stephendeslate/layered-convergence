// [TRACED:EM-AC-001] Transaction CRUD with tenant isolation
// [TRACED:EM-AC-002] Transaction state machine with validated transitions
// [TRACED:EM-PV-003] Transaction state machine enforces valid transitions only
// [TRACED:EM-SA-004] findFirst calls have justification comments

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { validateTransition, TRANSACTION_TRANSITIONS } from '@escrow-marketplace/shared';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { amount: number; currency: string; buyerId: string; sellerId: string; description: string; tenantId: string }) {
    return this.prisma.transaction.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        description: data.description,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.transaction.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async transition(id: string, tenantId: string, newStatus: TransactionStatus) {
    const transaction = await this.findOne(id, tenantId);

    try {
      validateTransition(transaction.status, newStatus, TRANSACTION_TRANSITIONS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid transition';
      throw new BadRequestException(message);
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.transaction.delete({ where: { id } });
  }
}
