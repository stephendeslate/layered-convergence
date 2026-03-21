import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { DisputeStatus } from '@escrow-marketplace/shared';

// TRACED: EM-SM-DISP-001 — Dispute state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['UNDER_REVIEW', 'CLOSED'],
  UNDER_REVIEW: ['RESOLVED_BUYER', 'RESOLVED_SELLER', 'ESCALATED'],
  RESOLVED_BUYER: ['CLOSED'],
  RESOLVED_SELLER: ['CLOSED'],
  ESCALATED: ['RESOLVED_BUYER', 'RESOLVED_SELLER'],
  CLOSED: [],
};

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTransaction(transactionId: string) {
    return this.prisma.dispute.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async transition(id: string, toStatus: DisputeStatus) {
    // findFirst: may have multiple disputes, scoped by id
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const allowed = VALID_TRANSITIONS[dispute.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${dispute.status} to ${toStatus}`,
      );
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: toStatus,
        resolvedAt: ['RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'].includes(toStatus)
          ? new Date()
          : undefined,
      },
    });
  }
}
