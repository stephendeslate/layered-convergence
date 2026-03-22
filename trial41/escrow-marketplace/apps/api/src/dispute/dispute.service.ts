// TRACED:EM-DISPUTE-01 dispute service with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { normalizePageParams } from '@em/shared';

const disputeSelect = {
  id: true,
  reason: true,
  resolution: true,
  status: true,
  transactionId: true,
  filerId: true,
  respondentId: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  filer: { select: { id: true, email: true } },
  respondent: { select: { id: true, email: true } },
  transaction: { select: { id: true, status: true } },
} as const;

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto, filerId: string) {
    return this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        filerId,
        respondentId: dto.respondentId,
        tenantId: dto.tenantId,
      },
      select: disputeSelect,
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where: { tenantId },
        select: disputeSelect,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispute.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for multi-tenant data isolation
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, tenantId },
      select: disputeSelect,
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  async update(id: string, tenantId: string, dto: UpdateDisputeDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dispute.update({
      where: { id },
      data: dto,
      select: disputeSelect,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispute.delete({ where: { id } });
  }
}
