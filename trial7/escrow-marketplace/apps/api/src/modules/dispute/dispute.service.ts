import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus, DisputeResolution } from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(raisedById: string, dto: CreateDisputeDto) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { id: dto.transactionId },
    });

    if (transaction.status !== TransactionStatus.HELD) {
      throw new BadRequestException(
        'Disputes can only be raised on held transactions',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          transactionId: dto.transactionId,
          raisedById,
          reason: dto.reason,
          evidence: dto.evidence ? toJsonField(dto.evidence) : undefined,
        },
      });

      await tx.transaction.update({
        where: { id: dto.transactionId },
        data: { status: TransactionStatus.DISPUTED },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: dto.transactionId,
          fromState: TransactionStatus.HELD,
          toState: TransactionStatus.DISPUTED,
          reason: `Dispute raised: ${dto.reason}`,
        },
      });

      return dispute;
    });
  }

  async findAll() {
    return this.prisma.dispute.findMany({
      include: { transaction: true, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true },
    });

    if (dispute.resolution) {
      throw new BadRequestException('Dispute has already been resolved');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: {
          resolution: dto.resolution,
          resolvedAt: new Date(),
        },
      });

      let newStatus: TransactionStatus;
      switch (dto.resolution) {
        case DisputeResolution.BUYER_FAVOR:
          newStatus = TransactionStatus.REFUNDED;
          break;
        case DisputeResolution.PROVIDER_FAVOR:
          newStatus = TransactionStatus.RELEASED;
          break;
        case DisputeResolution.SPLIT:
          newStatus = TransactionStatus.REFUNDED;
          break;
        case DisputeResolution.ESCALATED:
          newStatus = TransactionStatus.DISPUTED;
          break;
        default: {
          const _exhaustive: never = dto.resolution;
          throw new BadRequestException(
            `Invalid dispute resolution: ${_exhaustive}`,
          );
        }
      }

      await tx.transactionStateHistory.create({
        data: {
          transactionId: dispute.transactionId,
          fromState: TransactionStatus.DISPUTED,
          toState: newStatus,
          reason: `Dispute resolved: ${dto.resolution}`,
        },
      });

      return tx.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: newStatus },
        include: {
          stateHistory: { orderBy: { timestamp: 'asc' } },
          disputes: true,
        },
      });
    });
  }
}
