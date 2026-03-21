import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionService } from '../transaction/transaction.service.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { DisputeResolution, TransactionStatus } from '../../generated/prisma/enums.js';
import type { User } from '../../generated/prisma/client.js';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(dto: CreateDisputeDto, user: User) {
    await this.transactionService.transition(
      dto.transactionId,
      TransactionStatus.DISPUTED,
      user,
      dto.reason,
    );

    return this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: user.id,
        reason: dto.reason,
        evidence: dto.evidence ?? null,
      },
    });
  }

  async findById(id: string) {
    // findFirst annotated: lookup by primary key, guaranteed unique
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async resolve(id: string, dto: ResolveDisputeDto, user: User) {
    const dispute = await this.findById(id);

    if (dto.resolution === DisputeResolution.BUYER_WINS) {
      await this.transactionService.transition(
        dispute.transactionId,
        TransactionStatus.REFUNDED,
        user,
        'Dispute resolved: buyer wins',
      );
    } else if (dto.resolution === DisputeResolution.PROVIDER_WINS) {
      await this.transactionService.transition(
        dispute.transactionId,
        TransactionStatus.RELEASED,
        user,
        'Dispute resolved: provider wins',
      );
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        resolution: dto.resolution,
        resolvedAt: new Date(),
      },
    });
  }
}
