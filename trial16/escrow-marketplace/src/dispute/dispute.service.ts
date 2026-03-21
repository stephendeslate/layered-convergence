import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

/** Statuses from which a dispute can be filed */
const DISPUTABLE_STATUSES: TransactionStatus[] = [
  TransactionStatus.FUNDED,
  TransactionStatus.SHIPPED,
  TransactionStatus.DELIVERED,
];

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(dto: CreateDisputeDto, user: CurrentUserPayload) {
    // Verify transaction exists
    const transaction = await this.transactionService.findOne(dto.transactionId);

    // Only participants (buyer/seller) can file disputes
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot file disputes');
    }

    // Participant check
    if (
      transaction.buyerId !== user.sub &&
      transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException('Only transaction participants can file disputes');
    }

    // Verify the transaction is in a disputable state
    if (!DISPUTABLE_STATUSES.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} status`,
      );
    }

    // Transition the transaction to DISPUTED
    await this.transactionService.transition(
      dto.transactionId,
      TransactionStatus.DISPUTED,
      user,
    );

    return this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        filedById: user.sub,
        reason: dto.reason,
        evidence: dto.evidence,
      },
      include: { transaction: true, filedBy: true },
    });
  }

  async findAll(user: CurrentUserPayload) {
    if (user.role === Role.ADMIN) {
      return this.prisma.dispute.findMany({
        include: { transaction: true, filedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.dispute.findMany({
      where: { filedById: user.sub },
      include: { transaction: true, filedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    // findUnique with justification: lookup by primary key
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        transaction: { include: { buyer: true, seller: true } },
        filedBy: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findOneWithAccess(id: string, user: CurrentUserPayload) {
    const dispute = await this.findOne(id);

    // Access check: must be filer, transaction participant, or admin
    if (
      user.role !== Role.ADMIN &&
      dispute.filedById !== user.sub &&
      dispute.transaction.buyerId !== user.sub &&
      dispute.transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException('You do not have access to this dispute');
    }

    return dispute;
  }

  async submitEvidence(
    id: string,
    dto: SubmitEvidenceDto,
    user: CurrentUserPayload,
  ) {
    const dispute = await this.findOneWithAccess(id, user);

    // Only the transaction participants (not admin) can submit evidence
    if (
      dispute.transaction.buyerId !== user.sub &&
      dispute.transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException('Only transaction participants can submit evidence');
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        evidence: dispute.evidence
          ? `${dispute.evidence}\n---\n${dto.evidence}`
          : dto.evidence,
      },
      include: { transaction: true, filedBy: true },
    });
  }

  async resolve(
    id: string,
    dto: ResolveDisputeDto,
    user: CurrentUserPayload,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can resolve disputes');
    }

    const dispute = await this.findOne(id);

    // Verify transaction is in DISPUTED state
    if (dispute.transaction.status !== TransactionStatus.DISPUTED) {
      throw new BadRequestException(
        'Transaction is not in DISPUTED status',
      );
    }

    // Transition to RESOLVED
    await this.transactionService.transition(
      dispute.transactionId,
      TransactionStatus.RESOLVED,
      user,
    );

    return this.prisma.dispute.update({
      where: { id },
      data: { resolution: dto.resolution },
      include: { transaction: true, filedBy: true },
    });
  }
}
