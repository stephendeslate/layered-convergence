// TRACED: EM-DSVC-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto, UpdateDisputeDto } from './disputes.dto';
import { DisputeStatus } from '@prisma/client';
import { clampPageSize, paginationToSkipTake } from '@escrow-marketplace/shared';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto, raisedById: string) {
    return this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        raisedById,
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        reason: true,
        resolution: true,
        status: true,
        transactionId: true,
        raisedById: true,
        resolvedById: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(page: number = 1, pageSize?: number) {
    const clampedSize = clampPageSize(pageSize);
    const { skip, take } = paginationToSkipTake({ page, pageSize: clampedSize });
    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        skip,
        take,
        select: {
          id: true,
          reason: true,
          resolution: true,
          status: true,
          transactionId: true,
          raisedById: true,
          resolvedById: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispute.count(),
    ]);
    return {
      data,
      meta: { page, pageSize: clampedSize, total, totalPages: Math.ceil(total / clampedSize) },
    };
  }

  async findOne(id: string) {
    // findFirst: lookup by primary key id, single result expected
    const dispute = await this.prisma.dispute.findFirst({
      where: { id },
      select: {
        id: true,
        reason: true,
        resolution: true,
        status: true,
        transactionId: true,
        raisedById: true,
        resolvedById: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        raisedBy: { select: { id: true, name: true } },
        resolvedBy: { select: { id: true, name: true } },
        transaction: { select: { id: true, status: true } },
      },
    });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async update(id: string, dto: UpdateDisputeDto) {
    await this.findOne(id);
    return this.prisma.dispute.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as DisputeStatus }),
        ...(dto.resolution !== undefined && { resolution: dto.resolution }),
        ...(dto.resolvedById !== undefined && { resolvedById: dto.resolvedById }),
      },
      select: {
        id: true,
        reason: true,
        resolution: true,
        status: true,
        transactionId: true,
        raisedById: true,
        resolvedById: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dispute.delete({
      where: { id },
      select: { id: true },
    });
  }
}
