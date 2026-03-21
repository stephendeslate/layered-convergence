import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionService } from '../transaction/transaction.service.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { DisputeResolution, TransactionStatus } from '../../generated/prisma/enums.js';
import type { User } from '../../generated/prisma/client.js';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

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

  async findByTransactionId(transactionId: string) {
    // findFirst annotated: transactionId is unique on disputes, safe single-result lookup
    const dispute = await this.prisma.dispute.findFirst({
      where: { transactionId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found for this transaction');
    }

    return dispute;
  }

  async submitEvidence(id: string, evidence: string) {
    const dispute = await this.findById(id);

    return this.prisma.dispute.update({
      where: { id: dispute.id },
      data: { evidence },
    });
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
