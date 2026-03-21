import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, PayoutStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

// [TRACED:AC-005] Payout state machine: PENDING -> PROCESSING -> COMPLETED | FAILED
// [TRACED:PV-004] Seller payout lifecycle ensures funds release after completion
const VALID_PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  [PayoutStatus.PENDING]: [PayoutStatus.PROCESSING],
  [PayoutStatus.PROCESSING]: [PayoutStatus.COMPLETED, PayoutStatus.FAILED],
  [PayoutStatus.COMPLETED]: [],
  [PayoutStatus.FAILED]: [PayoutStatus.PENDING],
};

@Injectable()
export class PayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(userId: string, dto: CreatePayoutDto) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to verify transaction is completed and user is seller — justification: authorization + business rule validation
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        sellerId: userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Transaction must be completed before payout');
    }

    return this.prisma.payout.create({
      data: {
        amount: dto.amount,
        sellerId: userId,
        transactionId: dto.transactionId,
      },
    });
  }

  async findAll(userId: string) {
    await this.tenantContext.setCurrentUser(userId);

    return this.prisma.payout.findMany({
      where: { sellerId: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate payout with seller scope — justification: combines ID lookup with seller authorization
    const payout = await this.prisma.payout.findFirst({
      where: { id, sellerId: userId },
      include: { transaction: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  async updateStatus(userId: string, id: string, status: PayoutStatus) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate payout for status update — justification: verifies seller ownership before transition
    const payout = await this.prisma.payout.findFirst({
      where: { id, sellerId: userId },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    const allowedNext = VALID_PAYOUT_TRANSITIONS[payout.status];
    if (!allowedNext.includes(status)) {
      throw new BadRequestException(
        `Cannot transition payout from ${payout.status} to ${status}`,
      );
    }

    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        processedAt: status === PayoutStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
