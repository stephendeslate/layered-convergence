import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_DISPUTE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['UNDER_REVIEW', 'ESCALATED'],
  UNDER_REVIEW: ['RESOLVED', 'ESCALATED'],
  ESCALATED: ['RESOLVED'],
  RESOLVED: [],
};

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTransaction(transactionId: string) {
    return this.prisma.dispute.findMany({
      where: { transactionId },
      include: { arbiter: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related arbiter
    // and transaction for the full dispute detail view
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
      include: { arbiter: true, transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async create(data: {
    reason: string;
    transactionId: string;
    arbiterId?: string;
  }) {
    return this.prisma.dispute.create({
      data: {
        reason: data.reason,
        transactionId: data.transactionId,
        arbiterId: data.arbiterId,
      },
    });
  }

  async transitionStatus(id: string, newStatus: string, resolution?: string) {
    // findFirst: looking up by primary key but validating current status for
    // state machine transition logic before performing the update
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    const allowed = VALID_DISPUTE_TRANSITIONS[dispute.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition dispute from ${dispute.status} to ${newStatus}`,
      );
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: newStatus as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED',
        resolution: newStatus === 'RESOLVED' ? resolution : undefined,
      },
    });
  }
}
