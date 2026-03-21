import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, DisputeStatus, Role } from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputeService {
  constructor(private prisma: PrismaService) {}

  // [TRACED:AC-009] POST /disputes - buyer opens dispute on funded transaction
  async create(userId: string, userRole: string, dto: CreateDisputeDto) {
    if (userRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can open disputes');
    }

    await this.prisma.setRlsContext(userId);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can dispute this transaction');
    }

    if (transaction.status !== TransactionStatus.FUNDED) {
      throw new BadRequestException(
        'Can only dispute funded transactions',
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        reason: dto.reason,
      },
      include: { transaction: true },
    });

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTED },
    });

    return dispute;
  }

  async findAll(userId: string) {
    await this.prisma.setRlsContext(userId);

    return this.prisma.dispute.findMany({
      where: {
        transaction: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.prisma.setRlsContext(userId);

    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      dispute.transaction.buyerId !== userId &&
      dispute.transaction.sellerId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return dispute;
  }

  // [TRACED:AC-010] PATCH /disputes/:id/resolve - resolves open dispute and transitions transaction
  async resolve(userId: string, id: string, dto: ResolveDisputeDto) {
    await this.prisma.setRlsContext(userId);

    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: dto.resolution,
      },
      include: { transaction: true },
    });

    await this.prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: TransactionStatus.RESOLVED },
    });

    return updated;
  }
}
