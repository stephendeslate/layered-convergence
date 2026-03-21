import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(userId: string, role: string, dto: CreateDisputeDto) {
    const transaction = await this.transactionService.findById(
      dto.transactionId,
      userId,
      role,
    );

    const dispute = await this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: transaction.id,
        userId,
      },
    });

    await this.transactionService.updateStatus(
      transaction.id,
      TransactionStatus.DISPUTED,
      userId,
      role,
    );

    return dispute;
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.dispute.findMany({
        include: { transaction: true, user: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.dispute.findMany({
      where: { userId },
      include: { transaction: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, role: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, user: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (role !== 'ADMIN' && dispute.userId !== userId) {
      throw new ForbiddenException('Access denied to this dispute');
    }

    return dispute;
  }

  async resolve(id: string, resolution: string, userId: string, role: string) {
    const dispute = await this.findById(id, userId, role);

    return this.prisma.dispute.update({
      where: { id: dispute.id },
      data: { resolution },
    });
  }
}
