import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { DisputeResolution } from './dto/resolve-dispute.dto';
import { TransactionStatus } from '../transaction/dto/transition-transaction.dto';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    await this.transactionService.transition(
      dto.transactionId,
      TransactionStatus.DISPUTED,
    );

    return this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        userId,
        reason: dto.reason,
      },
      include: { transaction: true, user: true },
    });
  }

  async findAll() {
    return this.prisma.dispute.findMany({
      include: { transaction: true, user: true },
    });
  }

  async findOne(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, user: true },
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute ${id} not found`);
    }
    return dispute;
  }

  async resolve(id: string, resolution: DisputeResolution) {
    const dispute = await this.findOne(id);

    const newStatus =
      resolution === DisputeResolution.REFUNDED
        ? TransactionStatus.REFUNDED
        : TransactionStatus.RELEASED;

    await this.transactionService.transition(
      dispute.transactionId,
      newStatus,
    );

    return this.prisma.dispute.update({
      where: { id },
      data: { resolved: true },
      include: { transaction: true, user: true },
    });
  }
}
