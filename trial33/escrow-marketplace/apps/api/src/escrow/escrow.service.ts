import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';
import type { EscrowStatus } from '@escrow-marketplace/shared';

// TRACED: EM-SM-ESC-001 — Escrow state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['FUNDED', 'CANCELLED'],
  FUNDED: ['DELIVERED', 'DISPUTED', 'REFUNDED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: [],
  DISPUTED: ['REFUNDED', 'RELEASED'],
  REFUNDED: [],
  CANCELLED: [],
};

@Injectable()
export class EscrowService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    await this.prisma.setTenantContext(tenantId);
    const transactions = await this.prisma.escrowTransaction.findMany({
      where: { tenantId },
      include: { disputes: true },
      orderBy: { createdAt: 'desc' },
    });

    // TRACED: EM-REQ-DISP-001 — Uses shared paginate utility
    return paginate(transactions, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by tenantId for RLS alignment
    const tx = await this.prisma.escrowTransaction.findFirst({
      where: { id, tenantId },
      include: { disputes: true, buyer: true, seller: true },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }

  async transition(id: string, toStatus: EscrowStatus, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by tenantId for RLS alignment
    const tx = await this.prisma.escrowTransaction.findFirst({
      where: { id, tenantId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const allowed = VALID_TRANSITIONS[tx.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${tx.status} to ${toStatus}`,
      );
    }

    return this.prisma.escrowTransaction.update({
      where: { id },
      data: { status: toStatus },
    });
  }
}
