import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['UNDER_REVIEW', 'ESCALATED'],
  UNDER_REVIEW: ['RESOLVED', 'ESCALATED'],
  ESCALATED: ['RESOLVED'],
  RESOLVED: [],
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

  async findById(id: string) {
    // findFirst: looking up by primary key but returning null instead of
    // throwing, allowing the caller to handle not-found explicitly
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async create(data: { reason: string; transactionId: string; filedById: string }) {
    return this.prisma.dispute.create({
      data: {
        reason: data.reason,
        transactionId: data.transactionId,
        filedById: data.filedById,
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

    const allowed = VALID_TRANSITIONS[dispute.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${dispute.status} to ${newStatus}`,
      );
    }

    const updateData: Record<string, string> = {
      status: newStatus,
    };

    if (newStatus === 'RESOLVED' && resolution) {
      updateData.resolution = resolution;
    }

    return this.prisma.dispute.update({
      where: { id },
      data: updateData,
    });
  }
}
