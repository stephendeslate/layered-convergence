import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['UNDER_REVIEW', 'ESCALATED'],
  UNDER_REVIEW: ['RESOLVED', 'ESCALATED'],
  RESOLVED: [],
  ESCALATED: ['UNDER_REVIEW', 'RESOLVED'],
};

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTransaction(transactionId: string) {
    return this.prisma.dispute.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related transaction;
    // we use findFirst to allow future extension with arbiter scoping in
    // the where clause for role-based security filtering
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async transitionStatus(id: string, newStatus: string, resolution?: string) {
    // findFirst: looking up by primary key after needing to validate current
    // status for state machine transition; findUnique doesn't support the
    // additional business logic check needed before update
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    const allowed = VALID_TRANSITIONS[dispute.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${dispute.status} to ${newStatus}`,
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

  async create(data: { reason: string; transactionId: string; arbiterId?: string }) {
    return this.prisma.dispute.create({
      data: {
        reason: data.reason,
        transactionId: data.transactionId,
        arbiterId: data.arbiterId,
      },
    });
  }
}
