// TRACED: EM-API-014 — Disputes service with CRUD operations
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { paginate } from '@escrow-marketplace/shared';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto) {
    return this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where: { tenantId },
        select: {
          id: true,
          reason: true,
          status: true,
          transactionId: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispute.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped dispute lookup with transaction relation
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, tenantId },
      include: {
        transaction: {
          select: { id: true, amount: true, status: true, buyerId: true, sellerId: true },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async update(id: string, tenantId: string, dto: UpdateDisputeDto) {
    const dispute = await this.findOne(id, tenantId);

    const updateData: Record<string, unknown> = {};
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.prisma.dispute.update({
      where: { id: dispute.id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    const dispute = await this.findOne(id, tenantId);

    return this.prisma.dispute.delete({
      where: { id: dispute.id },
    });
  }
}
