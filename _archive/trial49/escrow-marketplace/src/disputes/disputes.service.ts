import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const transaction = await this.transactionsService.findById(
      dto.transactionId,
    );

    const disputableStatuses: TransactionStatus[] = [
      TransactionStatus.PAYMENT_HELD,
      TransactionStatus.DELIVERED,
    ];
    if (!disputableStatuses.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} status`,
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: userId,
        reason: dto.reason,
        evidence: dto.evidence,
        status: DisputeStatus.OPEN,
      },
    });

    await this.transactionsService.updateStatus(
      dto.transactionId,
      TransactionStatus.DISPUTED,
      `Dispute raised: ${dto.reason}`,
      userId,
    );

    return dispute;
  }

  async findAll() {
    return this.prisma.dispute.findMany({
      include: { transaction: true, raisedBy: true },
    });
  }

  async findById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute ${id} not found`);
    }
    return dispute;
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminId: string) {
    const dispute = await this.findById(id);

    if (
      dispute.status !== DisputeStatus.OPEN &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot resolve a dispute in ${dispute.status} status`,
      );
    }

    const newTransactionStatus =
      dto.resolution === 'RESOLVED_BUYER'
        ? TransactionStatus.REFUNDED
        : TransactionStatus.RELEASED;

    await this.transactionsService.updateStatus(
      dispute.transactionId,
      newTransactionStatus,
      `Dispute resolved: ${dto.reason}`,
      adminId,
    );

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.resolution as DisputeStatus,
        resolution: dto.reason,
        resolvedAt: new Date(),
      },
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prisma.dispute.findMany({
      where: { transactionId },
      include: { raisedBy: true },
    });
  }
}
