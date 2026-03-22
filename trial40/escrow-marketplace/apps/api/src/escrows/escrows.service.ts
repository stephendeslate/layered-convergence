// TRACED: EM-API-012 — Escrows service with CRUD operations
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { paginate } from '@escrow-marketplace/shared';

@Injectable()
export class EscrowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEscrowDto) {
    return this.prisma.escrowAccount.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        transactionId: dto.transactionId,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.escrowAccount.findMany({
        where: { tenantId },
        select: {
          id: true,
          amount: true,
          transactionId: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.escrowAccount.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped escrow account lookup
    const escrow = await this.prisma.escrowAccount.findFirst({
      where: { id, tenantId },
      include: {
        transaction: {
          select: { id: true, amount: true, status: true, buyerId: true, sellerId: true },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow account not found');
    }

    return escrow;
  }

  async update(id: string, tenantId: string, dto: UpdateEscrowDto) {
    const escrow = await this.findOne(id, tenantId);

    const updateData: Record<string, unknown> = {};
    if (dto.amount !== undefined) updateData.amount = new Prisma.Decimal(dto.amount);

    return this.prisma.escrowAccount.update({
      where: { id: escrow.id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    const escrow = await this.findOne(id, tenantId);

    return this.prisma.escrowAccount.delete({
      where: { id: escrow.id },
    });
  }
}
