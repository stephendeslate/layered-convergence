import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-003] Dispute service with state machine transitions
@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  // [TRACED:SA-003] Dispute state machine transition map
  private readonly validTransitions: Record<string, string[]> = {
    OPEN: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['RESOLVED', 'ESCALATED'],
    RESOLVED: [],
    ESCALATED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string) {
    await this.tenantContext.setUserContext(userId);
    return this.prisma.dispute.findMany({
      where: { filedById: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.tenantContext.setUserContext(userId);
    // findFirst justified: filtering by id + filedById for access control
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, filedById: userId },
      include: { transaction: true },
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute ${id} not found`);
    }
    return dispute;
  }

  async create(data: { transactionId: string; reason: string; filedById: string }) {
    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: data.transactionId,
        reason: data.reason,
        filedById: data.filedById,
      },
    });
    this.logger.log(`Dispute created: ${dispute.id}`);
    return dispute;
  }

  async transition(id: string, userId: string, targetStatus: string, resolution?: string) {
    const dispute = await this.findOne(id, userId);
    const allowed = this.validTransitions[dispute.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition dispute from ${dispute.status} to ${targetStatus}`,
      );
    }
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: targetStatus as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED',
        resolution: resolution ?? dispute.resolution,
      },
    });
  }
}
