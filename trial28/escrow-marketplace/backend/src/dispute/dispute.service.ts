import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dispute.findMany({
      include: { transaction: true, arbiter: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst justified: fetching by primary key
    return this.prisma.dispute.findFirst({
      where: { id },
      include: { transaction: true, arbiter: true },
    });
  }

  async transitionStatus(id: string, newStatus: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: newStatus as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED',
        resolvedAt: newStatus === 'RESOLVED' ? new Date() : undefined,
      },
    });
  }
}
