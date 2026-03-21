import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-004] Payout service with state machine transitions
@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  // [TRACED:SA-004] Payout state machine transition map
  private readonly validTransitions: Record<string, string[]> = {
    PENDING: ['PROCESSING'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string) {
    await this.tenantContext.setUserContext(userId);
    return this.prisma.payout.findMany({
      where: { recipientId: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.tenantContext.setUserContext(userId);
    // findFirst justified: filtering by id + recipientId for access control
    const payout = await this.prisma.payout.findFirst({
      where: { id, recipientId: userId },
      include: { transaction: true },
    });
    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }
    return payout;
  }

  async create(data: { transactionId: string; recipientId: string; amount: number }) {
    const payout = await this.prisma.payout.create({
      data: {
        transactionId: data.transactionId,
        recipientId: data.recipientId,
        amount: data.amount,
      },
    });
    this.logger.log(`Payout created: ${payout.id}`);
    return payout;
  }

  async transition(id: string, userId: string, targetStatus: string, failureReason?: string) {
    const payout = await this.findOne(id, userId);
    const allowed = this.validTransitions[payout.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition payout from ${payout.status} to ${targetStatus}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: targetStatus,
    };

    if (targetStatus === 'COMPLETED' || targetStatus === 'FAILED') {
      updateData.processedAt = new Date();
    }
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    return this.prisma.payout.update({
      where: { id },
      data: updateData,
    });
  }
}
