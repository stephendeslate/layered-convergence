import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-002] Transaction CRUD service with state machine transitions
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  // [TRACED:SA-002] Transaction state machine transition map
  private readonly validTransitions: Record<string, string[]> = {
    PENDING: ['FUNDED'],
    FUNDED: ['RELEASED', 'REFUNDED'],
    RELEASED: ['COMPLETED'],
    COMPLETED: [],
    REFUNDED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string) {
    await this.tenantContext.setUserContext(userId);
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.tenantContext.setUserContext(userId);
    // findFirst justified: filtering by id + user participation for access control
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true, payouts: true },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async create(data: { buyerId: string; sellerId: string; amount: number; description?: string; currency?: string }) {
    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        amount: data.amount,
        description: data.description,
        currency: data.currency ?? 'USD',
      },
    });
    this.logger.log(`Transaction created: ${transaction.id}`);
    return transaction;
  }

  async transition(id: string, userId: string, targetStatus: string) {
    const transaction = await this.findOne(id, userId);
    const allowed = this.validTransitions[transaction.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition transaction from ${transaction.status} to ${targetStatus}`,
      );
    }
    return this.prisma.transaction.update({
      where: { id },
      data: { status: targetStatus as 'PENDING' | 'FUNDED' | 'RELEASED' | 'COMPLETED' | 'REFUNDED' },
    });
  }
}
