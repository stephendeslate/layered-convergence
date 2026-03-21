import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

// [TRACED:AC-004] Dispute lifecycle: OPEN -> RESOLVED
@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to verify transaction exists and user is participant — justification: authorization check before dispute creation
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      transaction.status !== TransactionStatus.FUNDED &&
      transaction.status !== TransactionStatus.SHIPPED &&
      transaction.status !== TransactionStatus.DELIVERED
    ) {
      throw new BadRequestException('Transaction is not in a disputable state');
    }

    // Update transaction status to DISPUTE
    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTE },
    });

    return this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        filedById: userId,
      },
    });
  }

  async findAll(userId: string) {
    await this.tenantContext.setCurrentUser(userId);

    return this.prisma.dispute.findMany({
      where: { filedById: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate dispute with user scope — justification: combines ID lookup with ownership verification
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, filedById: userId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async resolve(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate dispute for resolution — justification: verifies dispute exists and belongs to user
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, filedById: userId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException('Dispute is not open');
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }
}
