import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DisputeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

// TRACED:PV-004: Dispute resolution workflow exists
@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto, userId: string) {
    // findFirst justification: verify the transaction exists and user is a party before filing dispute
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
      transaction.status !== 'FUNDED' &&
      transaction.status !== 'SHIPPED' &&
      transaction.status !== 'DELIVERED'
    ) {
      throw new BadRequestException(
        'Can only dispute funded, shipped, or delivered transactions',
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        filedById: userId,
        status: DisputeStatus.OPEN,
      },
    });

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: 'DISPUTE' },
    });

    return dispute;
  }

  async findAll(userId: string) {
    return this.prisma.dispute.findMany({
      where: { filedById: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    // findFirst justification: locate dispute by ID and verify the requesting user filed it
    const dispute = await this.prisma.dispute.findFirst({
      where: {
        id,
        filedById: userId,
      },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async resolve(id: string, userId: string) {
    const dispute = await this.findOne(id, userId);

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
