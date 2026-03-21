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
    await this.prisma.setRLSContext(user.sub, user.role);

    const transaction = await this.transactionService.findOne(dto.transactionId);

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot file disputes');
    }

    if (
      transaction.buyerId !== user.sub &&
      transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException('Only transaction participants can file disputes');
    }

    if (!DISPUTABLE_STATUSES.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} status`,
      );
    }

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
    await this.prisma.setRLSContext(user.sub, user.role);

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
    await this.prisma.setRLSContext(user.sub, user.role);

    const dispute = await this.findOne(id);

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
    await this.prisma.setRLSContext(user.sub, user.role);

    const dispute = await this.findOneWithAccess(id, user);

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

    await this.prisma.setRLSContext(user.sub, user.role);

    const dispute = await this.findOne(id);

    if (dispute.transaction.status !== TransactionStatus.DISPUTED) {
      throw new BadRequestException(
        'Transaction is not in DISPUTED status',
      );
    }

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
